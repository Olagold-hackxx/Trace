"""
Fraud feature engineering — two separate paths, identical outputs.

Architecture decision (hackathon):
  - 30-day history lookback for all features (single window, simple)
  - Inference path: ML service receives user_history in request body from backend
    (backend queries TimescaleDB; ML service stays stateless, no DB hop)
  - Training path: vectorised batch over the full DataFrame using groupby + rolling

Column conventions (actual data schema):
  amount_kobo : int      — transaction amount in kobo
  sender_name : str      — sender identifier
  type        : str      — 'inflow' or 'outflow'
  occurred_at : datetime — UTC timestamp
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Optional

import numpy as np
import pandas as pd

HISTORY_DAYS  = 30
COLD_START_N  = 5   # fewer than this → use cold-start defaults

# ─── Feature registry ────────────────────────────────────────────────────────

class FraudFeatures:
    FEATURE_NAMES = [
        "amount_zscore_user",        # how unusual is this amount for this user?
        "amount_log_ratio_median",   # log-scale ratio to user median (handles skew)
        "round_number_flag",         # 1 if amount is a suspicious round number
        "hour_rarity",               # how unusual is this hour for this user?
        "dow_rarity",                # how unusual is this day-of-week?
        "time_since_last_txn_s",     # seconds since prior transaction
        "sender_novelty",            # 1 = brand-new sender, 0 = known sender
        "days_since_first_sender",   # 0 if novel; else days since first seen
        "sender_conc_24h",           # fraction of last-24h txns from this sender
        "txn_count_1h",              # txns in the past 1 hour
        "txn_count_6h",              # txns in the past 6 hours
        "amount_match_24h",          # 1 if exact same amount seen in last 24h
        "reciprocity_24h",           # outflows / (inflows+1) with sender in 24h
        # Composite: captures score_pump multi-feature pattern (burst × novel senders)
        # Isolation Forest can't model interactions — this pre-encodes the conjunction.
        "burst_novel_score",         # txn_count_1h × sender_novelty × (1 - amount_log_ratio_median/10)
    ]

    # Returned when user history is too short to compute meaningful statistics
    COLD_START = {
        "amount_zscore_user":      0.0,
        "amount_log_ratio_median": 0.0,
        "round_number_flag":       0.0,   # computed from amount — still valid
        "hour_rarity":             0.5,
        "dow_rarity":              0.5,
        "time_since_last_txn_s":   86400.0,
        "sender_novelty":          1.0,
        "days_since_first_sender": 0.0,
        "sender_conc_24h":         1.0,
        "txn_count_1h":            0.0,   # 0 prior txns, not 1 (exclude self)
        "txn_count_6h":            0.0,
        "amount_match_24h":        0.0,
        "reciprocity_24h":         0.0,
        "burst_novel_score":       0.0,
    }


# ─── Inference path (online) ─────────────────────────────────────────────────

def compute_features_online(
    new_txn: dict,
    user_history: pd.DataFrame,
) -> dict[str, float]:
    """
    Compute all 13 fraud features for ONE incoming transaction.

    Args:
        new_txn     : dict with keys occurred_at, amount_kobo, sender_name, type
        user_history: this user's transactions from the last 30 days (pre-fetched).
                      Same schema: occurred_at, amount_kobo, sender_name, type.
                      Must NOT include new_txn itself.

    Returns:
        dict of feature_name → float, ready to pass to the Isolation Forest.
    """
    ts     = pd.Timestamp(new_txn["occurred_at"])
    amount = int(new_txn["amount_kobo"])
    sender = str(new_txn["sender_name"])

    # Ensure history is sorted and timestamps are parsed once
    hist = user_history.copy()
    if not hist.empty:
        hist["occurred_at"] = pd.to_datetime(hist["occurred_at"])
        hist = hist[hist["occurred_at"] < ts].sort_values("occurred_at")

    cold_start = len(hist) < COLD_START_N
    feats: dict[str, float] = {}

    # ── round_number_flag ─────────────────────────────────────────────────────
    # Divisible by ₦1,000 (100,000 kobo) — no history needed
    feats["round_number_flag"] = 1.0 if amount % 100_000 == 0 else 0.0

    if cold_start:
        result = dict(FraudFeatures.COLD_START)
        result["round_number_flag"] = feats["round_number_flag"]
        return result

    amounts = hist["amount_kobo"].astype(float)

    # ── amount_zscore_user ────────────────────────────────────────────────────
    mean_a = amounts.mean()
    std_a  = amounts.std()
    # Floor sigma at ₦10 (1,000 kobo) so a user who always sends the same amount
    # doesn't produce division-by-near-zero z-scores into the thousands.
    sigma  = max(float(std_a), 1_000.0) if not math.isnan(std_a) else 1_000.0
    feats["amount_zscore_user"] = float(np.clip((amount - mean_a) / sigma, -50.0, 50.0))

    # ── amount_log_ratio_median ───────────────────────────────────────────────
    median_a = amounts.median()
    feats["amount_log_ratio_median"] = (
        float(math.log(amount / median_a)) if median_a > 0 and amount > 0 else 0.0
    )

    # ── hour_rarity / dow_rarity ──────────────────────────────────────────────
    hours = hist["occurred_at"].dt.hour
    hour_freq = (hours == ts.hour).sum() / len(hist)
    feats["hour_rarity"] = float(1.0 - hour_freq)

    dows = hist["occurred_at"].dt.dayofweek
    dow_freq = (dows == ts.dayofweek).sum() / len(hist)
    feats["dow_rarity"] = float(1.0 - dow_freq)

    # ── time_since_last_txn_s ─────────────────────────────────────────────────
    last_ts = hist["occurred_at"].max()
    feats["time_since_last_txn_s"] = float((ts - last_ts).total_seconds())

    # ── sender features ───────────────────────────────────────────────────────
    sender_hist = hist[hist["sender_name"] == sender]
    feats["sender_novelty"] = 0.0 if len(sender_hist) > 0 else 1.0
    feats["days_since_first_sender"] = (
        float((ts - sender_hist["occurred_at"].min()).total_seconds() / 86400)
        if len(sender_hist) > 0 else 0.0
    )

    # ── velocity: txn_count_1h / txn_count_6h ────────────────────────────────
    feats["txn_count_1h"] = float(
        (hist["occurred_at"] >= ts - timedelta(hours=1)).sum()
    )
    feats["txn_count_6h"] = float(
        (hist["occurred_at"] >= ts - timedelta(hours=6)).sum()
    )

    # ── sender_conc_24h ───────────────────────────────────────────────────────
    last_24h = hist[hist["occurred_at"] >= ts - timedelta(hours=24)]
    feats["sender_conc_24h"] = (
        float((last_24h["sender_name"] == sender).sum() / len(last_24h))
        if len(last_24h) > 0 else 1.0
    )

    # ── amount_match_24h ──────────────────────────────────────────────────────
    feats["amount_match_24h"] = float(
        1.0 if (last_24h["amount_kobo"] == amount).any() else 0.0
    )

    # ── reciprocity_24h ───────────────────────────────────────────────────────
    sender_24h = last_24h[last_24h["sender_name"] == sender]
    inflows    = (sender_24h["type"] == "inflow").sum()
    outflows   = (sender_24h["type"] == "outflow").sum()
    feats["reciprocity_24h"] = float(outflows / (inflows + 1))

    # ── burst_novel_score (composite) ─────────────────────────────────────────
    # High when: many txns in last hour + sender is novel + amount is small/normal.
    # Encodes the score_pump conjunction that IF can't express as interactions.
    log_ratio_penalty = max(0.0, feats["amount_log_ratio_median"]) / 10.0
    feats["burst_novel_score"] = float(
        feats["txn_count_1h"] * feats["sender_novelty"] * max(0.0, 1.0 - log_ratio_penalty)
    )

    return feats


# ─── Training path (batch) ───────────────────────────────────────────────────

def compute_features_batch(transactions_df: pd.DataFrame) -> pd.DataFrame:
    """
    Vectorised feature computation over all transactions for training.

    Pipeline (target <15 min on 22.7M rows):
      1. Sort by (user_id, occurred_at) once.
      2. Expanding per-user stats (zscore, log_ratio) via pandas — C-level.
      3. Pandas rolling("1H"/"6H", closed="left") for count features.
      4. groupby().diff() for time_since_last_txn_s.
      5. groupby().transform("first") for sender first-seen.
      6. Global user hour/dow frequency for rarity (small training-time bias,
         acceptable — exact expanding version is in compute_features_online).
      7. DuckDB self-join for amount_match_24h, sender_conc_24h, reciprocity_24h.

    Returns DataFrame with FEATURE_NAMES columns + any passthrough columns.
    """
    import duckdb

    df = transactions_df.copy()
    df["occurred_at"] = pd.to_datetime(df["occurred_at"])
    df = df.sort_values(["user_id", "occurred_at"]).reset_index(drop=True)
    df["_row_id"] = df.index.astype(np.int64)
    duck_cols = ["_row_id", "user_id", "occurred_at", "amount_kobo",
                 "sender_name", "type"]

    out = pd.DataFrame(index=df.index)

    # ── 1. round_number_flag ──────────────────────────────────────────────────
    out["round_number_flag"] = (df["amount_kobo"] % 100_000 == 0).astype(float)

    # ── 2. Expanding per-user amount statistics ───────────────────────────────
    # shift(1) = use only prior rows (point-in-time correct)
    amounts = df["amount_kobo"].astype(float)

    exp_mean   = df.groupby("user_id")["amount_kobo"].transform(
        lambda s: s.astype(float).expanding().mean().shift(1)
    )
    exp_std    = df.groupby("user_id")["amount_kobo"].transform(
        lambda s: s.astype(float).expanding().std().shift(1)
    )
    exp_median = df.groupby("user_id")["amount_kobo"].transform(
        lambda s: s.astype(float).expanding().median().shift(1)
    )

    # cold_mask: either mean or std is NaN (first row per user has NaN std)
    cold_mask = exp_mean.isna() | exp_std.isna()
    # Sigma floor: ₦10 (1,000 kobo). NaN fillna first so clip propagates correctly.
    sigma = exp_std.fillna(1_000.0).clip(lower=1_000.0)

    raw_z = np.where(~cold_mask, (amounts - exp_mean) / sigma, 0.0)
    # Clip to ±50: preserves the anomaly signal without extreme values
    # distorting Isolation Forest's tree splits (max was 18k before this floor).
    out["amount_zscore_user"] = np.clip(raw_z, -50.0, 50.0)

    out["amount_log_ratio_median"] = np.where(
        (~cold_mask) & (exp_median > 0) & (amounts > 0),
        np.log((amounts / exp_median).clip(lower=1e-9)),
        0.0,
    )

    # ── 3. Rolling time-window counts via DuckDB ─────────────────────────────
    # pandas rolling on a datetime index misaligns when users share timestamps.
    # DuckDB interval joins are simpler and correct.
    t = df[duck_cols]   # pre-declare for DuckDB queries below

    tc1 = duckdb.sql("""
        SELECT t1._row_id, COUNT(t2._row_id) AS txn_count_1h
        FROM t AS t1
        LEFT JOIN t AS t2
          ON  t2.user_id     = t1.user_id
          AND t2.occurred_at < t1.occurred_at
          AND t2.occurred_at >= t1.occurred_at - INTERVAL 1 HOUR
        GROUP BY t1._row_id
    """).df().set_index("_row_id")["txn_count_1h"]
    out["txn_count_1h"] = df["_row_id"].map(tc1).fillna(0.0).values

    tc6 = duckdb.sql("""
        SELECT t1._row_id, COUNT(t2._row_id) AS txn_count_6h
        FROM t AS t1
        LEFT JOIN t AS t2
          ON  t2.user_id     = t1.user_id
          AND t2.occurred_at < t1.occurred_at
          AND t2.occurred_at >= t1.occurred_at - INTERVAL 6 HOUR
        GROUP BY t1._row_id
    """).df().set_index("_row_id")["txn_count_6h"]
    out["txn_count_6h"] = df["_row_id"].map(tc6).fillna(0.0).values

    # ── 4. Time since last txn ────────────────────────────────────────────────
    out["time_since_last_txn_s"] = (
        df.groupby("user_id")["occurred_at"]
        .diff()
        .dt.total_seconds()
        .fillna(86400.0)
        .values
    )

    # ── 5. Sender first-seen features ─────────────────────────────────────────
    first_seen = (
        df.groupby(["user_id", "sender_name"])["occurred_at"]
        .transform("first")
    )
    days_first = (df["occurred_at"] - first_seen).dt.total_seconds() / 86400
    out["days_since_first_sender"] = days_first.values
    out["sender_novelty"]          = (days_first == 0).astype(float).values

    # ── 6. Hour / dow rarity (global frequency — small training-time bias) ────
    df["_hour"] = df["occurred_at"].dt.hour
    df["_dow"]  = df["occurred_at"].dt.dayofweek

    user_n          = df.groupby("user_id")["_row_id"].transform("count")
    user_hour_n     = df.groupby(["user_id", "_hour"])["_row_id"].transform("count")
    user_dow_n      = df.groupby(["user_id", "_dow"])["_row_id"].transform("count")
    out["hour_rarity"] = 1.0 - (user_hour_n / user_n).values
    out["dow_rarity"]  = 1.0 - (user_dow_n  / user_n).values

    # ── 7. DuckDB: remaining self-join features ───────────────────────────────

    # sender_conc_24h — fraction of last-24h txns from same sender
    sc = duckdb.sql("""
        SELECT t1._row_id,
               CASE WHEN COUNT(t2._row_id) > 0
                    THEN SUM(CASE WHEN t2.sender_name = t1.sender_name THEN 1.0 ELSE 0.0 END)
                         / COUNT(t2._row_id)
                    ELSE 1.0
               END AS sender_conc_24h
        FROM t AS t1
        LEFT JOIN t AS t2
          ON  t2.user_id      = t1.user_id
          AND t2.occurred_at  < t1.occurred_at
          AND t2.occurred_at >= t1.occurred_at - INTERVAL 24 HOUR
        GROUP BY t1._row_id
    """).df().set_index("_row_id")["sender_conc_24h"]
    out["sender_conc_24h"] = df["_row_id"].map(sc).fillna(1.0).values

    # amount_match_24h — 1 if exact amount seen in prior 24h window
    am = duckdb.sql("""
        SELECT t1._row_id,
               CASE WHEN COUNT(t2._row_id) > 0 THEN 1.0 ELSE 0.0 END AS amount_match_24h
        FROM t AS t1
        LEFT JOIN t AS t2
          ON  t2.user_id      = t1.user_id
          AND t2.occurred_at  < t1.occurred_at
          AND t2.occurred_at >= t1.occurred_at - INTERVAL 24 HOUR
          AND t2.amount_kobo  = t1.amount_kobo
        GROUP BY t1._row_id
    """).df().set_index("_row_id")["amount_match_24h"]
    out["amount_match_24h"] = df["_row_id"].map(am).fillna(0.0).values

    # reciprocity_24h — outflows / (inflows + 1) with same sender in prior 24h
    rp = duckdb.sql("""
        SELECT t1._row_id,
               SUM(CASE WHEN t2.type = 'outflow' THEN 1.0 ELSE 0.0 END)
               / (SUM(CASE WHEN t2.type = 'inflow'  THEN 1.0 ELSE 0.0 END) + 1.0)
               AS reciprocity_24h
        FROM t AS t1
        LEFT JOIN t AS t2
          ON  t2.user_id      = t1.user_id
          AND t2.sender_name  = t1.sender_name
          AND t2.occurred_at  < t1.occurred_at
          AND t2.occurred_at >= t1.occurred_at - INTERVAL 24 HOUR
        GROUP BY t1._row_id
    """).df().set_index("_row_id")["reciprocity_24h"]
    out["reciprocity_24h"] = df["_row_id"].map(rp).fillna(0.0).values

    # ── burst_novel_score (composite) ─────────────────────────────────────────
    log_ratio_penalty = out["amount_log_ratio_median"].clip(lower=0) / 10.0
    out["burst_novel_score"] = (
        out["txn_count_1h"] * out["sender_novelty"] * (1.0 - log_ratio_penalty).clip(lower=0)
    ).values

    # ── Passthrough columns ────────────────────────────────────────────────────
    for col in ["user_id", "occurred_at", "fraud_type", "is_fraud",
                "fraud_scenario_id"]:
        if col in df.columns:
            out[col] = df[col].values

    return out[
        FraudFeatures.FEATURE_NAMES
        + [c for c in ["user_id", "occurred_at", "fraud_type", "is_fraud",
                        "fraud_scenario_id"]
           if c in out.columns]
    ]
