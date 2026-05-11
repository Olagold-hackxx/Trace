"""
Feature engineering for fraud detection.

Computes transaction-level features for Isolation Forest anomaly detection.

Features:
- amount_z_score: Z-score of transaction amount within user's history
- time_of_day_rarity: Rarity of transaction hour (entropy-based)
- sender_novelty: How new the sender is (days since first transaction from sender)
- velocity: Transactions per hour in recent window
- reciprocity: Ratio of incoming to outgoing with this sender
- round_amount_pattern: Whether amount is round number (multiple of 10, 100, etc.)
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from scipy.stats import entropy
from typing import List, Dict


def compute_transaction_features(txns: pd.DataFrame, as_of: datetime) -> pd.DataFrame:
    """
    Compute transaction-level features for fraud detection.

    Args:
        txns: DataFrame with columns: user_id, sender_id, amount, occurred_at, direction (in/out)
        as_of: Point-in-time timestamp

    Returns:
        DataFrame with transaction features
    """
    # Filter to recent transactions (e.g., last 90 days)
    start = as_of - timedelta(days=90)
    recent_txns = txns[(txns['occurred_at'] >= start) & (txns['occurred_at'] < as_of)].copy()

    if len(recent_txns) == 0:
        return pd.DataFrame()

    # Sort by time
    recent_txns = recent_txns.sort_values('occurred_at')

    # Amount z-score
    amount_mean = recent_txns['amount'].mean()
    amount_std = recent_txns['amount'].std()
    recent_txns['amount_z_score'] = (recent_txns['amount'] - amount_mean) / amount_std if amount_std > 0 else 0

    # Time of day rarity
    recent_txns['hour'] = recent_txns['occurred_at'].dt.hour
    hour_counts = recent_txns['hour'].value_counts()
    total_txns = len(recent_txns)
    hour_probs = hour_counts / total_txns
    hour_entropy = entropy(hour_probs)
    max_entropy = entropy([1/24] * 24)  # max entropy for 24 hours
    recent_txns['time_of_day_rarity'] = hour_entropy / max_entropy if max_entropy > 0 else 0

    # Sender novelty (days since first transaction from this sender)
    first_sender_txn = recent_txns.groupby('sender_id')['occurred_at'].min()
    recent_txns['sender_first_txn'] = recent_txns['sender_id'].map(first_sender_txn)
    recent_txns['sender_novelty'] = (recent_txns['occurred_at'] - recent_txns['sender_first_txn']).dt.days

    # Velocity: transactions per hour in last 24 hours
    last_24h = as_of - timedelta(hours=24)
    velocity_txns = recent_txns[recent_txns['occurred_at'] >= last_24h]
    velocity = len(velocity_txns) / 24.0
    recent_txns['velocity'] = velocity  # same for all in window, but per transaction context

    # Reciprocity: ratio of incoming to outgoing with this sender
    def compute_reciprocity(group):
        incoming = (group['direction'] == 'in').sum()
        outgoing = (group['direction'] == 'out').sum()
        return incoming / outgoing if outgoing > 0 else np.inf if incoming > 0 else 0

    reciprocity = recent_txns.groupby('sender_id').apply(compute_reciprocity)
    recent_txns['reciprocity'] = recent_txns['sender_id'].map(reciprocity)

    # Round amount pattern
    def is_round(amount):
        amount_str = str(abs(amount))
        if '.' in amount_str:
            decimal_part = amount_str.split('.')[1]
            if len(decimal_part) > 2 and decimal_part[2:] == '0' * (len(decimal_part) - 2):
                return 1  # round to cents
        whole_part = amount_str.split('.')[0]
        if whole_part.endswith('00') or whole_part.endswith('000'):
            return 1
        return 0

    recent_txns['round_amount_pattern'] = recent_txns['amount'].apply(is_round)

    # Select features
    feature_cols = [
        'amount_z_score', 'time_of_day_rarity', 'sender_novelty',
        'velocity', 'reciprocity', 'round_amount_pattern'
    ]

    return recent_txns[feature_cols + ['occurred_at']].copy()


def aggregate_user_fraud_score(transaction_features: pd.DataFrame) -> float:
    """
    Aggregate transaction anomaly scores to user-level fraud score.

    For now, return the max anomaly score as the user's fraud score.
    """
    if len(transaction_features) == 0:
        return 0.0

    # Assuming anomaly_score is added later by the model
    # For now, return a placeholder
    return 0.0
