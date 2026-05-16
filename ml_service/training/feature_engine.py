"""
Feature engineering for credit scoring.

Takes raw transaction history + user metadata and produces a fixed-size
feature vector for the LightGBM model.

80 features across 6 families

Design contract:
- Same function used in training AND live inference (training-serving parity)
- Point-in-time correct: features at time T must not depend on data after T
- Handles missing/sparse data gracefully (returns NaN for undefined values)
- Each feature has a documented hypothesis tying it to default risk
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from scipy.stats import entropy, skew, kurtosis
from typing import Optional


# ============================================================
# Helpers
# ============================================================

def _slice_window(txns: pd.DataFrame,
                  as_of: datetime,
                  days: int) -> pd.DataFrame:
    """Return transactions in the `days` window ending at `as_of`.
    
    Strict point-in-time: transactions exactly at `as_of` are excluded
    (they belong to "now or later", not "before").
    """
    start = as_of - timedelta(days=days)
    mask = (txns['occurred_at'] >= start) & (txns['occurred_at'] < as_of)
    return txns[mask]


def _safe_div(numerator: float, denominator: float,
              default: float = np.nan) -> float:
    """Divide with explicit handling of zero/near-zero denominator."""
    if denominator is None or np.isnan(denominator) or abs(denominator) < 1e-9:
        return default
    return numerator / denominator


def _safe_cv(values: pd.Series, min_mean: float = 1.0) -> float:
    """Coefficient of variation with floor on the denominator."""
    if len(values) < 2:
        return np.nan
    mean = values.mean()
    if mean < min_mean:
        return np.nan
    return values.std() / mean




# ============================================================
# Family 1: Cash-flow magnitude
# ============================================================

def _features_magnitude(txns_all: pd.DataFrame,
                        as_of: datetime) -> dict:
    """How much money is flowing through this business?
    
    Hypothesis: bigger businesses generally have more buffer; size alone
    doesn't determine risk but it correlates with capacity to absorb shocks.
    """
    feats = {}
    
    # Inflow-only for these features (we don't simulate outflows yet)
    for window in [7, 30, 90]:
        w = _slice_window(txns_all, as_of, window)
        inflows = w[w['type'] == 'inflow']['amount_kobo']
        feats[f'total_inflow_{window}d'] = float(inflows.sum())
    
    # Distribution stats over the 30d window (most stable signal)
    w30 = _slice_window(txns_all, as_of, 30)
    inflows_30 = w30[w30['type'] == 'inflow']['amount_kobo']
    
    if len(inflows_30) > 0:
        feats['mean_txn_amount_30d'] = float(inflows_30.mean())
        feats['median_txn_amount_30d'] = float(inflows_30.median())
        feats['std_txn_amount_30d'] = float(inflows_30.std()) if len(inflows_30) > 1 else 0.0
        feats['max_txn_amount_30d'] = float(inflows_30.max())
    else:
        feats['mean_txn_amount_30d'] = np.nan
        feats['median_txn_amount_30d'] = np.nan
        feats['std_txn_amount_30d'] = np.nan
        feats['max_txn_amount_30d'] = np.nan
    
    # Outflow placeholder (will be meaningful once we add loan repayments)
    outflows_30 = w30[w30['type'] != 'inflow']['amount_kobo']
    feats['total_outflow_30d'] = float(outflows_30.sum())
    
    return feats

# ============================================================
# Family 2: Cash-flow velocity and regularity
# ============================================================

def _features_velocity(txns_all: pd.DataFrame,
                       as_of: datetime) -> dict:
    """How active and regular is this business?
    
    Hypothesis: more frequent and regular inflow activity correlates with
    a healthier business with steady customer demand. Long gaps and recent
    silence are warning signals.
    """
    feats = {}
    
    inflows_7d = _slice_window(txns_all, as_of, 7).query("type == 'inflow'")
    inflows_30d = _slice_window(txns_all, as_of, 30).query("type == 'inflow'")
    inflows_90d = _slice_window(txns_all, as_of, 90).query("type == 'inflow'")
    
    # Transaction counts
    feats['txn_count_7d'] = float(len(inflows_7d))
    feats['txn_count_30d'] = float(len(inflows_30d))
    feats['txn_count_90d'] = float(len(inflows_90d))
    
    # Active days and density
    active_days_30d = inflows_30d['occurred_at'].dt.date.nunique()
    feats['active_days_30d'] = float(active_days_30d)
    feats['activity_density_30d'] = float(active_days_30d / 30)
    feats['txns_per_active_day_30d'] = _safe_div(len(inflows_30d), active_days_30d)
    
    # Average gap between consecutive transactions in 30d
    if len(inflows_30d) >= 2:
        sorted_times = inflows_30d['occurred_at'].sort_values()
        gaps = sorted_times.diff().dropna().dt.total_seconds() / 86400
        feats['avg_gap_days_30d'] = float(gaps.mean())
    else:
        feats['avg_gap_days_30d'] = np.nan
    
    # Longest dry spell in 30d window
    end_date = (as_of - pd.Timedelta(days=1)).date()
    start_date = (as_of - pd.Timedelta(days=30)).date()
    date_range = pd.date_range(start=start_date, end=end_date, freq='D').date
    active_set = set(inflows_30d['occurred_at'].dt.date.unique())
    arr = np.array([1 if d in active_set else 0 for d in date_range])
    padded = np.concatenate([[1], arr, [1]])
    ones_at = np.where(padded == 1)[0]
    gaps_run = np.diff(ones_at) - 1
    feats['longest_dry_spell_30d'] = float(gaps_run.max()) if len(gaps_run) > 0 else 30.0
    
    # Days since last inflow (over full history, not just 30d)
    inflows_all = txns_all[txns_all['type'] == 'inflow']
    if len(inflows_all) > 0:
        last_inflow = inflows_all['occurred_at'].max()
        feats['days_since_last_txn'] = float((as_of - last_inflow).total_seconds() / 86400)
    else:
        feats['days_since_last_txn'] = np.nan
    
    return feats


# ============================================================
# Family 3: Cash-flow stability and concentration   
# ============================================================
def _features_stability(txns_all: pd.DataFrame,
                        as_of: datetime) -> dict:
    """How stable and predictable is this business's cash flow?"""
    feats = {}
    
    inflows_7d = _slice_window(txns_all, as_of, 7).query("type == 'inflow'")
    inflows_30d = _slice_window(txns_all, as_of, 30).query("type == 'inflow'")
    inflows_90d = _slice_window(txns_all, as_of, 90).query("type == 'inflow'")
    
    inflows_prior_7d = _slice_window(txns_all, as_of - timedelta(days=7), 7).query("type == 'inflow'")
    inflows_prior_30d = _slice_window(txns_all, as_of - timedelta(days=30), 30).query("type == 'inflow'")
    
    if len(inflows_30d) > 0:
        daily_30 = (inflows_30d
                    .set_index('occurred_at')['amount_kobo']
                    .resample('D')
                    .sum())
        end_date = (as_of - pd.Timedelta(days=1)).date()
        start_date = (as_of - pd.Timedelta(days=30)).date()
        full_range = pd.date_range(start=start_date, end=end_date, freq='D')
        daily_30 = daily_30.reindex(full_range, fill_value=0)
        feats["cv_daily_revenue_30d"] = _safe_cv(daily_30, min_mean=1.0)
    else:
        feats["cv_daily_revenue_30d"] = np.nan

    if len(inflows_90d) > 0:
        weekly = (inflows_90d
                .set_index('occurred_at')['amount_kobo']
                .resample('W-SUN')
                .sum())
        # Take only the last 12 complete weeks
        end_date = (as_of - pd.Timedelta(days=1)).normalize()  # midnight, no time component
        weeks_range = pd.date_range(end=end_date, periods=12, freq='W-SUN')
        weekly = weekly.reindex(weeks_range, fill_value=0)
        feats["cv_weekly_revenue_90d"] = _safe_cv(weekly, min_mean=1.0)
    else:
        feats["cv_weekly_revenue_90d"] = np.nan
    

    prior_7_sum = inflows_prior_7d['amount_kobo'].sum()
    current_7_sum = inflows_7d['amount_kobo'].sum()
    growth_wow = _safe_div(current_7_sum - prior_7_sum, prior_7_sum)
    if not np.isnan(growth_wow):
        growth_wow = float(np.clip(growth_wow, -10.0, 10.0))
    feats["revenue_growth_wow"] = growth_wow  

    
    prior_30_sum = inflows_prior_30d['amount_kobo'].sum()
    current_30_sum = inflows_30d['amount_kobo'].sum()
    growth_mom = _safe_div(current_30_sum - prior_30_sum, prior_30_sum)
    if not np.isnan(growth_mom):
        growth_mom = float(np.clip(growth_mom, -10.0, 10.0))
    feats["revenue_growth_mom"] = growth_mom
    
    if len(inflows_90d) > 0:
        daily_90 = (inflows_90d
                    .set_index('occurred_at')['amount_kobo']
                    .resample('D')
                    .sum())
        end_date = (as_of - pd.Timedelta(days=1)).date()
        start_date = (as_of - pd.Timedelta(days=90)).date()
        full_range_90 = pd.date_range(start=start_date, end=end_date, freq='D')
        daily_90 = daily_90.reindex(full_range_90, fill_value=0)
        median_daily = daily_90.median()
        if median_daily > 0:
            shock_mask = (daily_90 < 0.5 * median_daily) & (daily_90 > 0)
            feats["shock_days_count_90d"] = float(shock_mask.sum())
        else:
            feats["shock_days_count_90d"] = np.nan
    else:
        feats["shock_days_count_90d"] = np.nan
    
    if len(inflows_30d) > 0:
        dow = pd.Series(daily_30.index.dayofweek, index=daily_30.index)
        weekday_revs = daily_30[dow < 5]
        weekend_revs = daily_30[dow >= 5]
        weekday_mean = weekday_revs.mean() if len(weekday_revs) > 0 else 0
        weekend_mean = weekend_revs.mean() if len(weekend_revs) > 0 else 0
        ww_ratio = _safe_div(weekday_mean, weekend_mean)
        if not np.isnan(ww_ratio):
            ww_ratio = float(np.clip(ww_ratio, 0.0, 20.0))
        feats["weekday_weekend_ratio_30d"] = ww_ratio
    else:
        feats["weekday_weekend_ratio_30d"] = np.nan
        
    pace_7 = _safe_div(current_7_sum, 7)
    pace_30 = _safe_div(current_30_sum, 30)
    momentum = _safe_div(pace_7, pace_30)
    if not np.isnan(momentum):
        momentum = float(np.clip(momentum, 0.0, 10.0))
    feats["momentum_ratio"] = momentum
    
    return feats


# ============================================================
# Family 4: Cash-flow concentration and diversity
# ============================================================
def _features_concentration(txns_all: pd.DataFrame,
                            as_of: datetime) -> dict:
    """How concentrated or diversified are this business's revenue sources?
    
    Hypothesis: high concentration on a few customers is riskier (customer loss impact).
    Diversification is a sign of resilience. New customers indicate growth but higher churn risk.
    """
    
    feats = {
        'unique_senders_30d': np.nan,
        'hhi_senders_30d': np.nan,
        'top1_share_30d': np.nan,
        'top5_share_30d': np.nan,
        'top10_share_30d': np.nan,
        'new_customer_ratio_30d': np.nan,
    }
    
    inflows_30d = _slice_window(txns_all, as_of, 30).query("type == 'inflow'")
    inflows_prior_60d = _slice_window(txns_all, as_of - timedelta(days=30), 60).query("type == 'inflow'")
    
    if len(inflows_30d) == 0:
        return feats  # all NaN
    
    # --- unique_senders_30d: count of distinct senders ---
    unique_senders_30d = inflows_30d['sender_name'].nunique()
    feats['unique_senders_30d'] = float(unique_senders_30d)
    
    # --- HHI and top-N shares ---
    total_30d = inflows_30d['amount_kobo'].sum()
    sender_totals = inflows_30d.groupby('sender_name')['amount_kobo'].sum()
    sender_shares = sender_totals / total_30d
    
    # HHI = sum of (share)^2
    hhi = (sender_shares ** 2).sum()
    feats['hhi_senders_30d'] = float(hhi)
    
    # top1_share: largest sender
    top1_share = sender_shares.max()
    feats['top1_share_30d'] = float(top1_share)
    
    # top5_share: sum of top-5 senders
    top5_share = sender_shares.nlargest(5).sum()
    feats['top5_share_30d'] = float(top5_share)
    
    # top10_share: sum of top-10 senders
    top10_share = sender_shares.nlargest(10).sum()
    feats['top10_share_30d'] = float(top10_share)
    
    # --- new_customer_ratio_30d ---
    # Senders in current 30d window who were NOT in prior 60d
    senders_30d = set(inflows_30d['sender_name'].unique())
    senders_prior_60d = set(inflows_prior_60d['sender_name'].unique())
    new_senders = senders_30d - senders_prior_60d
    
    # Count transactions from new senders
    new_customer_txns = inflows_30d[inflows_30d['sender_name'].isin(new_senders)]
    new_customer_ratio = _safe_div(len(new_customer_txns), len(inflows_30d))
    feats['new_customer_ratio_30d'] = float(new_customer_ratio)
    
    return feats
  


# ============================================================
# Family 5: Behavioral features
# ============================================================
def _features_behavioral(txns_all: pd.DataFrame,
                         as_of: datetime) -> dict:
    """Behavioral patterns that hint at gaming or non-standard operation.
    
    Hypothesis: legitimate businesses follow human-scale patterns — peaks during
    trading hours, organic transaction amounts, varied timing. Round-number-heavy
    or hour-clustered or kurtosis-inflated distributions can indicate the
    transaction stream is artificial or being gamed to inflate the credit signal.
    """
    feats = {
        'hour_entropy_30d': np.nan,
        'business_hours_share_30d': np.nan,
        'amount_skewness_30d': np.nan,
        'amount_kurtosis_30d': np.nan,
        'round_amount_ratio_30d': np.nan,
        'mean_intertxn_seconds_30d': np.nan,
        'std_intertxn_seconds_30d': np.nan,
    }
    inflows_30d = _slice_window(txns_all, as_of, 30).query("type == 'inflow'")
    
    if len(inflows_30d) == 0:
        return feats
    
    # Hour-of-day entropy (24-bin, base 2; max possible = log2(24) ≈ 4.58)
    hours = inflows_30d['occurred_at'].dt.hour
    hour_counts = hours.value_counts(sort=False).reindex(range(24), fill_value=0).astype(float)
    hour_probs = hour_counts / hour_counts.sum()
    feats['hour_entropy_30d'] = float(entropy(hour_probs, base=2))
    
    # Business-hours share: 6am to 10pm
    business_hours_mask = hours.between(6, 21)  # inclusive: 6 through 21
    feats['business_hours_share_30d'] = float(business_hours_mask.mean())
    
    # Amount-distribution shape
    amounts = inflows_30d['amount_kobo'].astype(float)
    if len(amounts) >= 3:
        feats['amount_skewness_30d'] = float(skew(amounts))
    if len(amounts) >= 4:
        feats['amount_kurtosis_30d'] = float(kurtosis(amounts, fisher=True))
    
    # Round-amount ratio: divisible by ₦1000 (i.e., 100,000 kobo)
    rounded_mask = (inflows_30d['amount_kobo'] % 100000) == 0
    feats['round_amount_ratio_30d'] = float(rounded_mask.mean())
    
    # Inter-transaction timing
    sorted_times = inflows_30d['occurred_at'].sort_values()
    if len(sorted_times) >= 2:
        intertxn_secs = sorted_times.diff().dropna().dt.total_seconds()
        feats['mean_intertxn_seconds_30d'] = float(intertxn_secs.mean())
        if len(intertxn_secs) >= 2:
            feats['std_intertxn_seconds_30d'] = float(intertxn_secs.std())
    
    return feats


# ============================================================
# Family 6: Cohort/identity features (to be added)  
# ============================================================
def _features_identity(user_meta: dict, as_of: datetime) -> dict:
    """Features derived from user metadata (archetype, gender, etc.)
    
    Hypothesis: Different archetypes, demographics, and onboarding timing
    correlate with default risk patterns.
    """
    feats = {}
    
    if user_meta is None:
        feats['days_since_onboarding'] = np.nan
        feats['archetype'] = np.nan
        feats['market_location'] = np.nan
        feats['gender'] = np.nan
        feats['age_bracket'] = np.nan
        return feats
    
    # days_since_onboarding
    onboarding_date = user_meta.get('onboarding_date')
    if onboarding_date is not None and not pd.isna(onboarding_date):
        onboarding_dt = pd.to_datetime(onboarding_date)
        as_of_dt = pd.to_datetime(as_of)
        feats['days_since_onboarding'] = float((as_of_dt - onboarding_dt).total_seconds() / 86400)
    else:
        feats['days_since_onboarding'] = np.nan
    
    # Direct metadata features (LightGBM handles categorical natively)
    feats['archetype'] = user_meta.get('archetype', np.nan)
    feats['market_location'] = user_meta.get('market_location', np.nan)
    feats['gender'] = user_meta.get('gender', np.nan)
    feats['age_bracket'] = user_meta.get('age_bracket', np.nan)
    
    return feats


# ============================================================
# Main entry point (we'll build this up family by family)
# ============================================================
def compute_features(txns: pd.DataFrame,
                     as_of: datetime,
                     user_meta: Optional[dict] = None) -> dict:
    """Compute the full feature vector for one user.
    
    Args:
        txns: that user's transaction history (a DataFrame).
              Required columns: occurred_at, amount_kobo, type, sender_name.
        as_of: timestamp at which to compute features.
               Transactions on or after this are EXCLUDED.
        user_meta: optional dict with cohort/identity info
                   (archetype, gender, market_location, age_bracket,
                    onboarding_date, etc.)
    
    Returns:
        Flat dict of feature_name -> numeric value.
    """
    # Step 1: point-in-time filter (NON-NEGOTIABLE - always first)
    txns = txns[txns['occurred_at'] < as_of].copy()
    
    feats = {}
    
    # Family 1: magnitude
    feats.update(_features_magnitude(txns, as_of))
    
    # Family 2: velocity
    feats.update(_features_velocity(txns, as_of))
    
    # Family 3: stability
    feats.update(_features_stability(txns, as_of))
    
    # Family 4: concentration
    feats.update(_features_concentration(txns, as_of))
    
    # Family 5: behavioral
    feats.update(_features_behavioral(txns, as_of))
    
    # Family 6: cohort/identity
    feats.update(_features_identity(user_meta, as_of))
    
    return feats



def compute_features_batch(users_df: pd.DataFrame,
                            txns_df: pd.DataFrame,
                            as_of: datetime) -> pd.DataFrame:
    """Compute features for every user. Returns a DataFrame, one row per user."""
    txns_df = txns_df.copy()
    txns_df['occurred_at'] = pd.to_datetime(txns_df['occurred_at'])
    
    # Group transactions by user once (much faster than filtering per user)
    txns_by_user = dict(tuple(txns_df.groupby('user_id')))
    
    rows = []
    failed = []
    for i, (_, user) in enumerate(users_df.iterrows()):
        if i % 500 == 0:
            print(f"  {i}/{len(users_df)}...")
        
        user_id = user['user_id']
        user_txns = txns_by_user.get(user_id, pd.DataFrame(columns=txns_df.columns))
        user_meta = user.to_dict()
        
        try:
            feats = compute_features(user_txns, as_of, user_meta)
            feats['user_id'] = user_id
            rows.append(feats)
        except Exception as e:
            failed.append((user_id, str(e)))
    
    if failed:
        print(f"\nWARNING: {len(failed)} users failed feature computation")
        for uid, err in failed[:5]:
            print(f"  {uid}: {err}")
    
    return pd.DataFrame(rows)


# ============================================================
# Validation helper
# ============================================================

EXPECTED_FEATURES_FAMILY_1 = {
    'total_inflow_7d', 'total_inflow_30d', 'total_inflow_90d',
    'mean_txn_amount_30d', 'median_txn_amount_30d',
    'std_txn_amount_30d', 'max_txn_amount_30d',
    'total_outflow_30d',
}

EXPECTED_FEATURES_FAMILY_2 = {
    'txn_count_7d', 'txn_count_30d', 'txn_count_90d',
    'active_days_30d', 'activity_density_30d', 'txns_per_active_day_30d',
    'avg_gap_days_30d', 'longest_dry_spell_30d', 'days_since_last_txn',
}

EXPECTED_FEATURES_FAMILY_3 = {
    'cv_weekly_revenue_90d',
    'cv_daily_revenue_30d',
    'revenue_growth_wow',
    'revenue_growth_mom',
    'momentum_ratio',
    'shock_days_count_90d',
    'weekday_weekend_ratio_30d',
}

EXPECTED_FEATURES_FAMILY_4 = {
    'unique_senders_30d',
    'hhi_senders_30d',
    'top1_share_30d',
    'top5_share_30d',
    'top10_share_30d',
    'new_customer_ratio_30d',
}

EXPECTED_FEATURES_FAMILY_5 = {
    'hour_entropy_30d',
    'business_hours_share_30d',
    'amount_skewness_30d',
    'amount_kurtosis_30d',
    'round_amount_ratio_30d',
    'mean_intertxn_seconds_30d',
    'std_intertxn_seconds_30d',
}

EXPECTED_FEATURES_FAMILY_6 = {
    'days_since_onboarding',
    'archetype',
    'market_location',
    'gender',
    'age_bracket'
}


def validate_features(feats: dict, expected: set) -> list:
    """Returns list of issues; empty list means clean."""
    issues = []
    
    missing = expected - set(feats.keys())
    if missing:
        issues.append(f"Missing keys: {missing}")
    
    extra = set(feats.keys()) - expected
    if extra:
        issues.append(f"Unexpected keys: {extra}")
    
    for k, v in feats.items():
        if isinstance(v, float):
            if np.isinf(v):
                issues.append(f"Infinity in {k}")
    
    return issues