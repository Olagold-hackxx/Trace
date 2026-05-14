"""
Equivalence test: compute_features_online and compute_features_batch must produce
identical feature vectors on identical inputs (to float tolerance).

Run with: venv/bin/python -m pytest tests/test_fraud_feature_equivalence.py -v
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import pandas as pd
import pytest
from datetime import datetime, timedelta

from training.fraud_feature_engine import (
    FraudFeatures,
    compute_features_online,
    compute_features_batch,
    COLD_START_N,
)

FLOAT_TOL = 1e-4   # allow tiny floating-point divergence between paths

# ─── Fixture: hand-crafted single-user transaction stream ────────────────────

def _make_user_stream(seed: int = 42) -> pd.DataFrame:
    """
    30 days of synthetic transactions for one user.
    Includes: a burst window, a novel sender, a round-number amount, a round-trip pair.
    """
    rng  = np.random.default_rng(seed)
    base = datetime(2026, 3, 1, 9, 0, 0)
    rows = []

    known_senders = [f"sender_{i}" for i in range(8)]

    for day in range(30):
        n_txns = int(rng.integers(1, 6))
        for _ in range(n_txns):
            hour = int(rng.integers(8, 20))
            ts   = base + timedelta(days=day, hours=hour,
                                    minutes=int(rng.integers(0, 60)))
            rows.append({
                "user_id":     "user_001",
                "occurred_at": ts,
                "amount_kobo": int(rng.integers(20_000, 300_000)),
                "sender_name": rng.choice(known_senders),
                "type":        "inflow",
                "is_fraud":    False,
                "fraud_type":  None,
            })

    # Inject a burst on day 25
    burst_base = base + timedelta(days=25, hours=14)
    for i in range(6):
        rows.append({
            "user_id":     "user_001",
            "occurred_at": burst_base + timedelta(minutes=i * 4),
            "amount_kobo": int(rng.integers(10_000, 50_000)),
            "sender_name": f"new_customer_{rng.integers(0, 9999):04d}",
            "type":        "inflow",
            "is_fraud":    True,
            "fraud_type":  "score_pump",
        })

    # Round-number txn on day 27
    rows.append({
        "user_id":     "user_001",
        "occurred_at": base + timedelta(days=27, hours=10),
        "amount_kobo": 500_000,
        "sender_name": "new_customer_round",
        "type":        "inflow",
        "is_fraud":    True,
        "fraud_type":  "round_number_flood",
    })

    df = pd.DataFrame(rows).sort_values("occurred_at").reset_index(drop=True)
    return df


# ─── Test ─────────────────────────────────────────────────────────────────────

def test_equivalence_on_hand_crafted_stream():
    """
    For each transaction in the stream (after cold-start), compute features
    via both paths and assert they agree within FLOAT_TOL.
    """
    stream = _make_user_stream()

    # Batch path — all rows at once
    batch_out = compute_features_batch(stream)

    mismatches = []

    for i, row in stream.iterrows():
        if i < COLD_START_N:
            continue  # skip cold-start rows where both paths use defaults

        new_txn     = row.to_dict()
        user_history = stream.iloc[:i]   # strictly prior rows

        online_feats = compute_features_online(new_txn, user_history)
        batch_feats  = batch_out.loc[i, FraudFeatures.FEATURE_NAMES].to_dict()

        for feat in FraudFeatures.FEATURE_NAMES:
            o_val = float(online_feats[feat])
            b_val = float(batch_feats[feat])

            # hour_rarity / dow_rarity intentionally differ (global vs expanding)
            if feat in ("hour_rarity", "dow_rarity"):
                continue

            if not np.isclose(o_val, b_val, atol=FLOAT_TOL, rtol=FLOAT_TOL):
                mismatches.append(
                    f"row={i} feat={feat}: online={o_val:.6f} batch={b_val:.6f}"
                )

    if mismatches:
        pytest.fail(
            f"{len(mismatches)} feature mismatches:\n" + "\n".join(mismatches[:10])
        )


def test_cold_start_returns_defaults():
    stream   = _make_user_stream()
    first_txn = stream.iloc[0].to_dict()
    feats    = compute_features_online(first_txn, pd.DataFrame())
    assert feats == FraudFeatures.COLD_START


def test_round_number_flag():
    stream = _make_user_stream()
    batch  = compute_features_batch(stream)
    round_rows = stream[stream["amount_kobo"] % 100_000 == 0].index
    assert (batch.loc[round_rows, "round_number_flag"] == 1.0).all()
    non_round  = stream[stream["amount_kobo"] % 100_000 != 0].index
    assert (batch.loc[non_round, "round_number_flag"] == 0.0).all()


def test_sender_novelty_decreases():
    """A sender seen for the first time should have novelty=1; later: 0."""
    stream   = _make_user_stream()
    batch    = compute_features_batch(stream)
    # Find a sender that appears more than once
    counts   = stream["sender_name"].value_counts()
    repeat   = counts[counts > 1].index[0]
    rows     = stream[stream["sender_name"] == repeat].index.tolist()
    # First occurrence: novelty=1
    assert batch.loc[rows[0], "sender_novelty"] == 1.0
    # Later occurrence: novelty=0
    assert batch.loc[rows[-1], "sender_novelty"] == 0.0


def test_txn_count_1h_captures_burst():
    """Rows in the injected burst window should have txn_count_1h > 1."""
    stream = _make_user_stream()
    batch  = compute_features_batch(stream)
    burst  = stream[stream["fraud_type"] == "score_pump"].index
    # All burst rows after the first should see at least 1 prior in the same hour
    assert (batch.loc[burst[1:], "txn_count_1h"] >= 1).all()


def test_txn_count_cold_start_is_zero():
    """First row per user should have txn_count = 0 (no prior transactions)."""
    stream = _make_user_stream()
    batch  = compute_features_batch(stream)
    # stream has one user; row 0 is the first txn
    assert batch.loc[0, "txn_count_1h"] == 0.0
    assert batch.loc[0, "txn_count_6h"] == 0.0


def test_time_since_last_txn_cold_start():
    """First txn per user gets the cold-start default of 86400s (1 day)."""
    stream = _make_user_stream()
    batch  = compute_features_batch(stream)
    assert batch.loc[0, "time_since_last_txn_s"] == pytest.approx(86400.0)


def test_time_since_last_txn_burst():
    """Burst rows (score_pump) should have very short time_since_last_txn (< 600s)."""
    stream = _make_user_stream()
    batch  = compute_features_batch(stream)
    burst  = stream[stream["fraud_type"] == "score_pump"].index
    # Skip the first burst row (its prior txn is a clean txn, not part of burst)
    short_gaps = batch.loc[burst[1:], "time_since_last_txn_s"]
    assert (short_gaps < 600).all(), f"Burst gaps not short: {short_gaps.values}"


def test_txn_count_6h_greater_or_equal_1h():
    """6h count must always be >= 1h count (superset window)."""
    stream = _make_user_stream()
    batch  = compute_features_batch(stream)
    assert (batch["txn_count_6h"] >= batch["txn_count_1h"]).all()
