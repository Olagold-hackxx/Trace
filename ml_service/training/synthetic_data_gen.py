"""
Synthetic Lagos data generation for training credit scoring model.

Design philosophy:
- Hand coded simulation to create realistic synthetic data that captures the key characteristics of real Lagos credit data.
Reason:  With GANs we lose ground truth but with hand coded simulation we know the latent risk function and can validate the model's ability to learn it.
- Multi-archetypes properties to capture the diversity of real Lagos informal economy.
- Generate transaction streams and ground truth labels
- Latent risk function are deliberately seperable from the features to test model's ability to learn the underlying risk patterns rather than just memorizing feature correlations.
"""


import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import List, Tuple
import uuid


# ============================================================
# Archetype definitions — calibrated against Nigerian informal
# economy patterns
# ============================================================

ARCHETYPES = {
    'market_food_vendor': {
        # daily revenue ~ lognormal; mean ~₦15k, fat right tail
        'daily_revenue_log_mean': np.log(15000),
        'daily_revenue_log_std': 0.45,
        # transactions per day ~ Poisson, many small txns
        'txns_per_day_lambda': 8.0,
        # customer base: small, very repeat-heavy
        'customer_base_size': 40,
        'repeat_customer_rate': 0.75,
        # Mon..Sun multipliers; Sat market day, Sun quiet
        'weekly_pattern': np.array([1.0, 1.05, 1.0, 1.0, 1.15, 1.4, 0.55]),
        # transaction size distribution
        'txn_log_mean': np.log(1800),
        'txn_log_std': 0.5,
        # business hours (24h floats)
        'active_hours': (6, 19),
        'peak_hours': (10, 14),
    },
    'electronics_retailer': {
        'daily_revenue_log_mean': np.log(45000),
        'daily_revenue_log_std': 0.6,
        'txns_per_day_lambda': 3.5,
        'customer_base_size': 90,
        'repeat_customer_rate': 0.38,
        'weekly_pattern': np.array([1.0, 1.0, 1.0, 1.0, 1.2, 1.45, 0.7]),
        'txn_log_mean': np.log(15000),
        'txn_log_std': 0.85,
        'active_hours': (9, 20),
        'peak_hours': (14, 18),
    },
    'tailor_artisan': {
        'daily_revenue_log_mean': np.log(8000),
        'daily_revenue_log_std': 0.5,
        'txns_per_day_lambda': 2.5,
        'customer_base_size': 60,
        'repeat_customer_rate': 0.6,
        'weekly_pattern': np.array([1.0, 1.0, 1.0, 1.0, 1.15, 1.3, 0.4]),
        'txn_log_mean': np.log(4000),
        'txn_log_std': 0.6,
        'active_hours': (8, 18),
        'peak_hours': (10, 16),
    },
    'okada_rider': {
        'daily_revenue_log_mean': np.log(6000),
        'daily_revenue_log_std': 0.35,  # very stable
        'txns_per_day_lambda': 12.0,
        'customer_base_size': 200,      # mostly one-off riders
        'repeat_customer_rate': 0.15,
        'weekly_pattern': np.array([1.1, 1.1, 1.1, 1.1, 1.15, 1.2, 0.85]),
        'txn_log_mean': np.log(500),
        'txn_log_std': 0.3,
        'active_hours': (6, 22),
        'peak_hours': (7, 9),
    },
    'pos_agent': {
        'daily_revenue_log_mean': np.log(25000),
        'daily_revenue_log_std': 0.4,
        'txns_per_day_lambda': 30.0,    # very high volume
        'customer_base_size': 300,
        'repeat_customer_rate': 0.40,
        'weekly_pattern': np.array([1.0, 1.0, 1.0, 1.0, 1.1, 1.2, 1.0]),
        'txn_log_mean': np.log(800),
        'txn_log_std': 0.7,
        'active_hours': (7, 21),
        'peak_hours': (9, 17),
    },
    'beauty_supplier': {
        'daily_revenue_log_mean': np.log(20000),
        'daily_revenue_log_std': 0.55,
        'txns_per_day_lambda': 4.5,
        'customer_base_size': 70,
        'repeat_customer_rate': 0.55,
        'weekly_pattern': np.array([0.9, 0.95, 1.0, 1.05, 1.2, 1.5, 0.8]),
        'txn_log_mean': np.log(5000),
        'txn_log_std': 0.7,
        'active_hours': (10, 20),
        'peak_hours': (15, 19),
    },
}

ARCHETYPE_NAMES = list(ARCHETYPES.keys())


# ============================================================
# Trader class to generate synthetic transaction data based on archetype properties
# ============================================================
@dataclass
class TraderProfile:
    user_id: str
    archetype: str
    onboarding_date: datetime
    # individual deviation from archetype norms
    revenue_multiplier: float
    volatility_multiplier: float
    growth_rate: float  # monthly growth in revenue
    customer_pool: List[str]
    # latent ground truth
    latent_discipline: float  # 0-1, how reliably they pay back
    latent_business_health: float  # 0-1, captures underlying business viability
    # demographic features (for potential model inputs)
    age_bracket: int
    gender: str
    market_location: str
    
def sample_trader_profile(rng: np.random.Generator,
                        onboarding_date: datetime) -> TraderProfile:
    archetype_name = rng.choice(ARCHETYPE_NAMES)
    archetype = ARCHETYPES[archetype_name]
    
    # Individual deviations
    revenue_multiplier = rng.normal(1.0, 0.15) 
    volatility_multiplier = rng.normal(1.0, 0.15)
    growth_rate = rng.normal(0.02, 0.01)  #
    
    #Build customer pool
    pool_size = archetype['customer_base_size']
    repeat_rate = archetype['repeat_customer_rate']
    num_repeat_customers = int(pool_size * repeat_rate)
    num_one_off_customers = pool_size - num_repeat_customers
    customer_pool = [f"{archetype_name}_repeat_{i}" for i in range(num_repeat_customers)] + \
                    [f"{archetype_name}_oneoff_{i}" for i in range(num_one_off_customers)]
    rng.shuffle(customer_pool)
    # Latent ground truth
    latent_discipline = float(np.clip(rng.beta(2, 5), 0, 1))  # skewed towards lower discipline
    latent_business_health = float(np.clip(rng.beta(5, 2), 0, 1))  # skewed towards healthier businesses
    
    
    # Demographics (for potential model features)
    age_bracket = rng.choice([1, 2, 3, 4])
    gender = rng.choice(['male',    'female'])
    market_location = rng.choice(['Lagos Island', 'Yaba', 'Mushin', 'Surulere', 'Ikeja', 'Ajah', 'Lekki', 'Idumota', 'Balogun', 'Oshodi', 'Ladipo', 'Alaba', 'Lawrence', 'Other '])
    
    return TraderProfile(
        user_id=str(uuid.uuid4()),
        archetype=archetype_name,
        onboarding_date=onboarding_date,
        revenue_multiplier=revenue_multiplier,
        volatility_multiplier=volatility_multiplier,
        growth_rate=growth_rate,
        customer_pool=customer_pool,
        latent_discipline=latent_discipline,
        latent_business_health=latent_business_health,
        age_bracket=age_bracket,
        gender=gender,
        market_location=market_location
    )
    

# ============================================================
# Function to generate transaction data for a list of traders for a day
# ============================================================
def simulate_day(profile: TraderProfile,
                 day_index: int,
                 date: datetime,
                 rng: np.random.Generator) -> List[dict]:
    """Generate transactions for one trader on one day."""
    archetype = ARCHETYPES[profile.archetype]
    # Adjust daily revenue for growth and day of week
    base_rev = np.random.lognormal(archetype['daily_revenue_log_mean'], archetype['daily_revenue_log_std'])
    growth_factor = (1 + profile.growth_rate) ** (day_index / 30)  # monthly growth
    weekly_factor = archetype['weekly_pattern'][date.weekday()]
    health_factor = 0.6 + 0.8 * profile.latent_business_health  # 0.6-1.4 range
    noise = np.exp(rng.normal(0, archetype['daily_revenue_log_std']
                              * profile.volatility_multiplier))    
    
    expected_daily_rev = (base_rev
                          * profile.revenue_multiplier
                          * growth_factor
                          * weekly_factor
                          * health_factor
                          * noise)
    
    # Occasional shocks (bad days)
    if rng.random() < 0.03:  # 3% of days
        expected_daily_rev *= rng.uniform(0.1, 0.5)
    
    # Number of transactions today
    expected_count = archetype['txns_per_day_lambda'] * weekly_factor * health_factor
    n_txns = rng.poisson(max(0.1, expected_count))
    
    if n_txns == 0:
        return []
    
    transactions = []
    for _ in range(n_txns):
        # Sender selection: repeat or new?
        is_repeat = rng.random() < archetype['repeat_customer_rate']
        if is_repeat:
            sender = rng.choice(profile.customer_pool)
        else:
            sender = f"new_customer_{uuid.uuid4().hex[:8]}"
        
        # Transaction amount — lognormal around archetype mean,
        # scaled so daily total approximates expected_daily_rev
        amount = np.exp(rng.normal(archetype['txn_log_mean'], archetype['txn_log_std']))
        amount = max(50, amount)  # ₦50 floor
        
        # Time of day
        active_start, active_end = archetype['active_hours']
        peak_start, peak_end = archetype['peak_hours']
        if rng.random() < 0.5:  # 50% during peak
            hour = rng.uniform(peak_start, peak_end)
        else:
            hour = rng.uniform(active_start, active_end)
        minute = rng.uniform(0, 60)
        timestamp = date + timedelta(hours=float(hour), minutes=float(minute))
        
        transactions.append({
            'user_id': profile.user_id,
            'occurred_at': timestamp,
            'amount_kobo': int(amount * 100),
            'sender_name': sender,
            'is_repeat_customer': is_repeat,
            'type': 'inflow',
        })
    
    # Rescale amounts so daily total matches expected (preserves shape)
    if transactions:
        current_total = sum(t['amount_kobo'] for t in transactions)
        target_total = expected_daily_rev * 100
        scale = target_total / current_total
        for t in transactions:
            t['amount_kobo'] = int(t['amount_kobo'] * scale)
    
    return transactions



# ============================================================
# Main function to simulate multiple traders over multiple days
# ============================================================

def simulate_trader(profile: TraderProfile,
                    days: int,
                    rng: np.random.Generator) -> pd.DataFrame:
    """Generate full transaction history for one trader."""
    all_txns = []
    for day_idx in range(days):
        date = profile.onboarding_date + timedelta(days=day_idx)
        all_txns.extend(simulate_day(profile, day_idx, date, rng))
    
    if not all_txns:
        return pd.DataFrame(columns=['user_id', 'occurred_at', 'amount_kobo',
                                      'sender_name', 'is_repeat_customer', 'type'])
    return pd.DataFrame(all_txns)



# ============================================================
# Latent default label generation
# ============================================================

def compute_latent_features(txns: pd.DataFrame,
                            profile: TraderProfile) -> dict:
    """Compute the features the TRUE risk function uses.
    These overlap with — but aren't identical to — what the model sees.
    """
    if len(txns) == 0:
        return {
            'cv_revenue': 2.0,         # extreme = bad
            'top1_concentration': 1.0,
            'growth_rate': -0.5,
            'txn_density': 0.0,
            'latent_discipline': profile.latent_discipline,
            'latent_health': profile.latent_business_health,
        }
    
    daily = txns.set_index('occurred_at').resample('D')['amount_kobo'].sum()
    daily_nonzero = daily[daily > 0]
    
    cv_revenue = (daily_nonzero.std() / daily_nonzero.mean()
                  if len(daily_nonzero) > 1 and daily_nonzero.mean() > 0
                  else 1.0)
    
    sender_totals = txns.groupby('sender_name')['amount_kobo'].sum()
    top1_concentration = (sender_totals.max() / sender_totals.sum()
                          if sender_totals.sum() > 0 else 1.0)
    
    n = len(daily)
    if n >= 14:
        first_half = daily.iloc[:n//2].mean()
        second_half = daily.iloc[n//2:].mean()
        growth_rate = ((second_half / first_half - 1)
                       if first_half > 0 else 0.0)
    else:
        growth_rate = 0.0
    
    txn_density = len(txns) / max(1, len(daily))
    
    return {
        'cv_revenue': float(cv_revenue),
        'top1_concentration': float(top1_concentration),
        'growth_rate': float(growth_rate),
        'txn_density': float(txn_density),
        'latent_discipline': profile.latent_discipline,
        'latent_health': profile.latent_business_health,
    }


def generate_default_label(latent: dict,
                           rng: np.random.Generator) -> Tuple[int, float]:
    risk_logit = (
        + 2.5 * min(latent['cv_revenue'], 3.0)       # was 1.8 — strengthen volatility signal
        + 2.0 * latent['top1_concentration']         # was 1.5 — strengthen concentration signal
        - 1.5 * np.clip(latent['growth_rate'], -1, 2)# was 1.2 — slightly stronger growth
        - 1.0 * min(latent['txn_density'] / 5, 2)    # was 0.8
        - 1.5 * latent['latent_discipline']          # was 2.5 — WEAKEN latent
        - 1.0 * latent['latent_health']              # was 1.5 — WEAKEN latent
        - 2.2                                         # intercept unchanged
        + rng.normal(0, 0.4)                         # noise unchanged
    )
    pd_true = 1.0 / (1.0 + np.exp(-risk_logit))
    default = int(rng.binomial(1, pd_true))
    return default, float(pd_true)


# ============================================================
# Population generation
# ============================================================

def generate_population(n_users: int = 10000,
                        days: int = 180,
                        seed: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Returns:
        users_df: one row per user with profile attributes + label
        txns_df: long-format transaction history
        labels_df: user_id, default, pd_true (ground truth for audit)
    """
    rng = np.random.default_rng(seed)
    
    users_records = []
    all_txns = []
    labels_records = []
    
    base_date = datetime(2025, 11, 1)  # ~6 months pre-hackathon
    
    for i in range(n_users):
        if i % 500 == 0:
            print(f"  generated {i}/{n_users} users...")
        
        profile = sample_trader_profile(rng, base_date)
        txns = simulate_trader(profile, days, rng)
        latent = compute_latent_features(txns, profile)
        default, pd_true = generate_default_label(latent, rng)
        
        users_records.append({
            'user_id': profile.user_id,
            'archetype': profile.archetype,
            'onboarding_date': profile.onboarding_date,
            'gender': profile.gender,
            'age_bracket': profile.age_bracket,
            'market_location': profile.market_location,
        })
        all_txns.append(txns)
        labels_records.append({
            'user_id': profile.user_id,
            'default': default,
            'pd_true': pd_true,
        })
    
    users_df = pd.DataFrame(users_records)
    txns_df = pd.concat(all_txns, ignore_index=True) if all_txns else pd.DataFrame()
    labels_df = pd.DataFrame(labels_records)
    
    return users_df, txns_df, labels_df


# ============================================================
# Sanity checks — run these to validate the data
# ============================================================

def sanity_check(users_df, txns_df, labels_df):
    print(f"\n{'='*60}")
    print("SYNTHETIC DATA SANITY CHECKS")
    print(f"{'='*60}\n")
    
    print(f"Users:        {len(users_df):,}")
    print(f"Transactions: {len(txns_df):,}")
    print(f"Default rate: {labels_df['default'].mean():.1%}")
    print(f"Mean true PD: {labels_df['pd_true'].mean():.3f}")
    
    print(f"\nDefault rate by archetype:")
    merged = users_df.merge(labels_df, on='user_id')
    print(merged.groupby('archetype')['default'].agg(['mean', 'count']))
    
    print(f"\nDefault rate by gender (should be roughly equal — gender NOT in risk fn):")
    print(merged.groupby('gender')['default'].agg(['mean', 'count']))
    
    print(f"\nDefault rate by market (should be roughly equal):")
    print(merged.groupby('market_location')['default'].agg(['mean', 'count']))
    
    print(f"\nTransactions per user (summary):")
    txn_per_user = txns_df.groupby('user_id').size()
    print(txn_per_user.describe())
    
    print(f"\nDaily revenue distribution (₦) — log10 scale:")
    daily_rev = (txns_df.set_index('occurred_at')
                        .groupby('user_id')['amount_kobo']
                        .resample('D').sum() / 100)
    print(np.log10(daily_rev[daily_rev > 0]).describe())


# ============================================================
# Main
# ============================================================

if __name__ == "__main__":
    import os
    os.makedirs("data", exist_ok=True)
    
    print("Generating synthetic Lagos trader population...")
    users_df, txns_df, labels_df = generate_population(
        n_users=10000, days=180, seed=42
    )
    
    sanity_check(users_df, txns_df, labels_df)
    
    print("\nSaving to data/...")
    for df, filename in [
        (users_df, "synth_users"),
        (txns_df, "synth_transactions"),
        (labels_df, "synth_labels"),
    ]:
        parquet_path = os.path.join("data", f"{filename}.parquet")
        try:
            df.to_parquet(parquet_path, index=False)
            print(f"Saved {parquet_path}")
        except ImportError:
            print(f"pyarrow/fastparquet unavailable, saved {csv_path} instead")
    print("Done.")
