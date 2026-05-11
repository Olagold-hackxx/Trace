"""Plain-language templates for SHAP factor explanations.

Each entry maps a feature name to phrasings used when the feature
is pushing score UP (positive_phrasing) vs DOWN (negative_phrasing).
The 'value' placeholder is filled at runtime.
"""

# Direction convention:
# 'lower_is_better' = high feature value → bad → score down (e.g. concentration)
# 'higher_is_better' = high feature value → good → score up (e.g. txn_count)

FEATURE_TEMPLATES = {
    # Concentration (lower is better)
    'top1_share_30d': {
        'direction': 'lower_is_better',
        'good': "Your customer base is well-diversified",
        'bad': "One customer accounts for {value:.0%} of your income",
        'format': 'pct',
    },
    'top5_share_30d': {
        'direction': 'lower_is_better',
        'good': "Your revenue is spread across many customers",
        'bad': "Your top 5 customers contribute {value:.0%} of revenue",
        'format': 'pct',
    },
    'hhi_senders_30d': {
        'direction': 'lower_is_better',
        'good': "Healthy customer diversity",
        'bad': "Revenue is concentrated among few senders",
        'format': 'raw',
    },
    'top10_share_30d': {
        'direction': 'lower_is_better',
        'good': "Income is broadly distributed",
        'bad': "Top 10 customers make up {value:.0%} of revenue",
        'format': 'pct',
    },
    
    # Stability (lower CV is better)
    'cv_weekly_revenue_90d': {
        'direction': 'lower_is_better',
        'good': "Your weekly revenue is stable and predictable",
        'bad': "Your weekly revenue swings by {value:.0%}",
        'format': 'pct',
    },
    'cv_daily_revenue_30d': {
        'direction': 'lower_is_better',
        'good': "Steady daily transaction flow",
        'bad': "Daily revenue is volatile",
        'format': 'raw',
    },
    
    # Velocity (higher is better)
    'txn_count_30d': {
        'direction': 'higher_is_better',
        'good': "You've completed {value:.0f} transactions this month",
        'bad': "Only {value:.0f} transactions in the last 30 days",
        'format': 'int',
    },
    'txn_count_90d': {
        'direction': 'higher_is_better',
        'good': "Strong transaction volume over 90 days",
        'bad': "Limited transaction history in last 90 days",
        'format': 'int',
    },
    'active_days_30d': {
        'direction': 'higher_is_better',
        'good': "Active on {value:.0f} of the last 30 days",
        'bad': "Active on only {value:.0f} of the last 30 days",
        'format': 'int',
    },
    'days_since_last': {
        'direction': 'lower_is_better',
        'good': "Recent transaction activity",
        'bad': "No transactions in the last {value:.0f} days",
        'format': 'int',
    },
    'longest_dry_spell_30d': {
        'direction': 'lower_is_better',
        'good': "Consistent transaction rhythm",
        'bad': "Went {value:.0f} days without transactions",
        'format': 'int',
    },
    'avg_gap_days_30d': {
        'direction': 'lower_is_better',
        'good': "Short gaps between transactions",
        'bad': "Average gap between transactions is {value:.1f} days",
        'format': 'raw',
    },
    
    # Growth (higher is better)
    'growth_wow': {
        'direction': 'higher_is_better',
        'good': "Revenue grew {value:.0%} week-over-week",
        'bad': "Revenue declined {value:.0%} week-over-week",
        'format': 'pct_signed',
    },
    'growth_mom': {
        'direction': 'higher_is_better',
        'good': "Revenue up {value:.0%} month-over-month",
        'bad': "Revenue down {value:.0%} month-over-month",
        'format': 'pct_signed',
    },
    'momentum_ratio': {
        'direction': 'higher_is_better',
        'good': "Recent revenue is trending up vs. long-term average",
        'bad': "Recent revenue is trending below your usual",
        'format': 'raw',
    },
    
    # Magnitude
    'total_inflow_30d': {
        'direction': 'higher_is_better',
        'good': "Strong monthly inflow of ₦{value:,.0f}",
        'bad': "Modest monthly inflow",
        'format': 'currency',
    },
    'mean_txn_amount_30d': {
        'direction': 'higher_is_better',
        'good': "Healthy average transaction size",
        'bad': "Low average transaction size",
        'format': 'raw',
    },
    
    # Behavioral
    'round_amount_ratio_30d': {
        'direction': 'lower_is_better',
        'good': "Transaction amounts look organic",
        'bad': "High share of suspiciously round-amount transactions",
        'format': 'pct',
    },
    'business_hours_share': {
        'direction': 'higher_is_better',
        'good': "Most activity during business hours",
        'bad': "Unusual transaction timing patterns",
        'format': 'pct',
    },
    
    # Identity (categorical — generic templates)
    'archetype': {
        'direction': 'neutral',
        'good': "Business type ({value}) is associated with lower risk",
        'bad': "Business type ({value}) carries higher baseline risk",
        'format': 'str',
    },
    'days_since_onboarding': {
        'direction': 'higher_is_better',
        'good': "{value:.0f} days of transaction history",
        'bad': "Limited history ({value:.0f} days since onboarding)",
        'format': 'int',
    },
}


def format_value(value, fmt: str) -> str:
    """Used internally — phrasings use Python format strings directly."""
    if fmt == 'pct':
        return f"{value:.0%}"
    if fmt == 'pct_signed':
        return f"{abs(value):.0%}"
    if fmt == 'int':
        return f"{value:.0f}"
    if fmt == 'currency':
        return f"₦{value:,.0f}"
    return str(value)


def get_phrasing(feature: str, value, shap_value: float) -> str | None:
    """Pick the right phrasing for a feature given its SHAP direction."""
    if feature not in FEATURE_TEMPLATES:
        return None  # Unknown feature → caller falls back to generic phrasing
    
    template = FEATURE_TEMPLATES[feature]
    # SHAP negative = pushes PD down = good for the user = score UP
    is_good_for_user = shap_value < 0
    phrasing = template['good'] if is_good_for_user else template['bad']
    
    try:
        return phrasing.format(value=value)
    except (ValueError, TypeError):
        return phrasing  # If formatting fails, drop the placeholder
    
    
import numpy as np

def shap_to_score_delta(shap_log_odds: float, baseline_pd: float) -> int:
    """Convert a single feature's SHAP contribution to score points.
    
    SHAP values are in log-odds (logit) space. The model output is:
        logit(pd) = baseline_logit + sum(shap_values)
    
    To compute the score impact of a single feature, we ask:
    'If we removed this feature's contribution, what would the score be?'
        score_without_feature = score(sigmoid(baseline_logit + total - this_shap))
        score_with_feature    = score(sigmoid(baseline_logit + total))
        delta = score_with - score_without
    
    Approximation here: we treat baseline_pd as 'where the user would be
    without this feature', and the feature pushes from baseline_pd to
    baseline_pd shifted by shap_log_odds in logit space.
    """
    baseline_pd = float(np.clip(baseline_pd, 1e-6, 1 - 1e-6))
    baseline_logit = np.log(baseline_pd / (1 - baseline_pd))
    
    new_logit = baseline_logit + shap_log_odds
    new_pd = 1 / (1 + np.exp(-new_logit))
    
    # Score change: each PD unit moves score by -550 (linear scaler) or via logit (logistic scaler)
    # Using the same logistic scaler as pd_to_score: score = 575 - 70 * logit
    # So delta_score = -70 * (new_logit - baseline_logit) = -70 * shap_log_odds
    # NOTE: this assumes calibrator is roughly identity in the relevant range.
    return int(round(-70 * shap_log_odds))