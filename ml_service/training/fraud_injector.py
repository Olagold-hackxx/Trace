"""
Generates synthetic fraud scenarios injected into clean transaction stream.

Output: synth_transactions_fraud.parquet
  - Same schema as synth_transactions.parquet
  - Plus: fraud_scenario_id (UUID), fraud_type (str), is_fraud (True)

Scenarios:
  score_pump            — tight burst from novel senders to inflate credit features
  large_novel_deposit   — single outsized deposit from a brand-new sender
  velocity_known_sender — abnormal frequency from one known sender
  round_trip            — inflow immediately reversed by outflow
  amount_cloning        — exact same amount repeated from many different senders
  dormancy_spike        — user with a real 30+ day gap suddenly floods transactions
  round_number_flood    — flood of suspiciously round kobo amounts
"""

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Literal

import numpy as np
import pandas as pd


FraudType = Literal[
    "score_pump",
    "large_novel_deposit",
    "velocity_known_sender",
    "round_trip",
    "amount_cloning",
    "dormancy_spike",
    "round_number_flood",
]

_SCHEMA_COLS = [
    "user_id", "occurred_at", "amount_kobo",
    "sender_name", "is_repeat_customer", "type",
    "fraud_scenario_id", "fraud_type", "is_fraud",
]


@dataclass
class InjectionConfig:
    target_scenarios: int = 2500
    max_scenarios_per_user: int = 2
    seed: int = 42

    scenario_weights: dict[FraudType, float] = field(default_factory=lambda: {
        "score_pump":             0.35,
        "large_novel_deposit":    0.20,
        "velocity_known_sender":  0.15,
        "round_trip":             0.10,
        "amount_cloning":         0.10,
        "dormancy_spike":         0.05,
        "round_number_flood":     0.05,
    })


class FraudInjector:
    def __init__(self, clean_df: pd.DataFrame, config: InjectionConfig):
        self.clean  = clean_df.copy()
        self.clean["occurred_at"] = pd.to_datetime(self.clean["occurred_at"])
        self.config = config
        self.rng    = np.random.default_rng(config.seed)

        print("  Computing user baselines...")
        self._user_stats = self._compute_user_stats()

        # Pre-sorted for dormancy gap lookup (one sort, reused)
        self._sorted_clean = self.clean.sort_values(["user_id", "occurred_at"])

        self._user_scenario_count: dict[str, int] = {}

    # ── Baseline stats (computed once) ────────────────────────────────────────

    def _compute_user_stats(self) -> pd.DataFrame:
        df = self.clean

        stats = df.groupby("user_id").agg(
            median_amount = ("amount_kobo", "median"),
            p95_amount    = ("amount_kobo", lambda x: x.quantile(0.95)),
            std_amount    = ("amount_kobo", "std"),
            txn_count     = ("amount_kobo", "count"),
            first_txn_at  = ("occurred_at", "min"),
            last_txn_at   = ("occurred_at", "max"),
        )

        senders = (
            df.groupby("user_id")["sender_name"]
            .apply(set)
            .rename("known_senders")
        )
        stats = stats.join(senders)

        span_days = (
            (stats["last_txn_at"] - stats["first_txn_at"])
            .dt.total_seconds() / 86400
        ).clip(lower=1)
        stats["txns_per_day"] = stats["txn_count"] / span_days
        stats["std_amount"]   = stats["std_amount"].fillna(0)

        # Max consecutive gap per user — used to find dormancy candidates
        df_s = df.sort_values(["user_id", "occurred_at"])
        gaps = (
            df_s.groupby("user_id")["occurred_at"]
            .apply(lambda s: s.diff().dt.total_seconds().div(86400).max())
            .rename("max_gap_days")
            .fillna(0)
        )
        stats = stats.join(gaps)

        return stats  # indexed by user_id

    # ── User selection helpers ────────────────────────────────────────────────

    def _eligible_users(self, min_txns: int = 20) -> list[str]:
        eligible = self._user_stats[self._user_stats["txn_count"] >= min_txns].index
        return [
            u for u in eligible
            if self._user_scenario_count.get(u, 0) < self.config.max_scenarios_per_user
        ]

    def _pick_users(self, n: int, min_txns: int = 20) -> list[str]:
        pool    = self._eligible_users(min_txns)
        n       = min(n, len(pool))
        chosen  = [pool[i] for i in self.rng.choice(len(pool), size=n, replace=False)]
        for u in chosen:
            self._user_scenario_count[u] = self._user_scenario_count.get(u, 0) + 1
        return chosen

    def _random_ts(self, user_id: str, buffer_hours: int = 24) -> datetime:
        s     = self._user_stats.loc[user_id]
        start = s["first_txn_at"] + timedelta(hours=buffer_hours)
        end   = s["last_txn_at"]  - timedelta(hours=buffer_hours)
        if end <= start:
            return s["first_txn_at"] + timedelta(hours=1)
        span = float((end - start).total_seconds())
        return start + timedelta(seconds=float(self.rng.uniform(0, span)))

    # Fix #4: Match existing `new_customer_<hex8>` naming — no `novel_` prefix
    # that a classifier could memorise as a regex-able signal.
    def _novel_sender(self, user_id: str) -> str:
        known = self._user_stats.loc[user_id, "known_senders"]
        for _ in range(20):
            name = f"new_customer_{uuid.uuid4().hex[:8]}"
            if name not in known:
                return name
        return f"new_customer_{uuid.uuid4().hex[:8]}"

    def _known_sender(self, user_id: str) -> str:
        known = list(self._user_stats.loc[user_id, "known_senders"])
        return known[int(self.rng.integers(0, len(known)))]

    def _typical_amount(self, user_id: str, scale: float = 1.0) -> int:
        s     = self._user_stats.loc[user_id]
        base  = s["median_amount"] * scale
        noise = self.rng.normal(0, max(s["std_amount"] * 0.1, base * 0.05))
        return max(1000, int(base + noise))

    @staticmethod
    def _scenario_id() -> str:
        return str(uuid.uuid4())

    @staticmethod
    def _make_df(rows: list[dict]) -> pd.DataFrame:
        if not rows:
            return pd.DataFrame(columns=_SCHEMA_COLS)
        df = pd.DataFrame(rows, columns=_SCHEMA_COLS)
        df["occurred_at"] = pd.to_datetime(df["occurred_at"])
        df["is_fraud"]    = True
        return df

    # ── Scenario 1: score_pump ────────────────────────────────────────────────

    def inject_score_pump(self, n_scenarios: int) -> pd.DataFrame:
        """
        Fix #1: Burst MUST be tight (15-45 min), sorted, not uniform over 2 hours.
        5-8 txns in ~30 min from novel senders → txn_count_1h spikes from ~1 to 8.
        """
        rows = []
        for user_id in self._pick_users(n_scenarios):
            sid           = self._scenario_id()
            base          = self._random_ts(user_id)
            n_txns        = int(self.rng.integers(5, 9))
            burst_minutes = float(self.rng.integers(15, 45))
            # Sorted offsets so timestamps are monotonically plausible
            offsets = sorted(self.rng.uniform(0, burst_minutes, size=n_txns).tolist())

            for off in offsets:
                rows.append({
                    "user_id":           user_id,
                    "occurred_at":       base + timedelta(minutes=off),
                    "amount_kobo":       int(self.rng.integers(5000, 30000)),
                    "sender_name":       self._novel_sender(user_id),
                    "is_repeat_customer": False,   # Fix #5: novel sender → False
                    "type":              "inflow",
                    "fraud_scenario_id": sid,
                    "fraud_type":        "score_pump",
                    "is_fraud":          True,
                })
        return self._make_df(rows)

    # ── Scenario 2: large_novel_deposit ──────────────────────────────────────

    def inject_large_novel_deposit(self, n_scenarios: int) -> pd.DataFrame:
        """Single deposit from a brand-new sender at 10–25× the user's median."""
        rows = []
        for user_id in self._pick_users(n_scenarios):
            scale = float(self.rng.uniform(10, 25))
            rows.append({
                "user_id":           user_id,
                "occurred_at":       self._random_ts(user_id),
                "amount_kobo":       self._typical_amount(user_id, scale=scale),
                "sender_name":       self._novel_sender(user_id),
                "is_repeat_customer": False,   # Fix #5
                "type":              "inflow",
                "fraud_scenario_id": self._scenario_id(),
                "fraud_type":        "large_novel_deposit",
                "is_fraud":          True,
            })
        return self._make_df(rows)

    # ── Scenario 3: velocity_known_sender ─────────────────────────────────────

    def inject_velocity_known_sender(self, n_scenarios: int) -> pd.DataFrame:
        """10–20 txns from one known sender packed into 60 min. Velocity is the signal."""
        rows = []
        for user_id in self._pick_users(n_scenarios):
            sid    = self._scenario_id()
            sender = self._known_sender(user_id)
            base   = self._random_ts(user_id)
            n_txns = int(self.rng.integers(10, 21))
            offsets = sorted(self.rng.uniform(0, 60, size=n_txns).tolist())

            for off in offsets:
                rows.append({
                    "user_id":           user_id,
                    "occurred_at":       base + timedelta(minutes=off),
                    "amount_kobo":       self._typical_amount(user_id),
                    "sender_name":       sender,
                    "is_repeat_customer": True,   # Fix #5: known sender → True
                    "type":              "inflow",
                    "fraud_scenario_id": sid,
                    "fraud_type":        "velocity_known_sender",
                    "is_fraud":          True,
                })
        return self._make_df(rows)

    # ── Scenario 4: round_trip ────────────────────────────────────────────────

    def inject_round_trip(self, n_scenarios: int) -> pd.DataFrame:
        """
        Inflow from a novel sender followed within 15–90 min by an outflow of the
        same amount back to the same sender. Clean data is inflow-only — the outflow
        is genuinely novel. sender_name on the outflow = recipient (same entity).
        """
        rows = []
        for user_id in self._pick_users(n_scenarios):
            sid    = self._scenario_id()
            # buffer_hours=4 leaves 90 min delay well inside the history window
            base   = self._random_ts(user_id, buffer_hours=4)
            amount = self._typical_amount(user_id, scale=float(self.rng.uniform(3, 8)))
            sender = self._novel_sender(user_id)
            delay  = timedelta(minutes=int(self.rng.integers(15, 90)))
            out_amount = int(amount * float(self.rng.uniform(0.95, 1.00)))

            rows.extend([
                {
                    "user_id":           user_id,
                    "occurred_at":       base,
                    "amount_kobo":       amount,
                    "sender_name":       sender,
                    "is_repeat_customer": False,
                    "type":              "inflow",
                    "fraud_scenario_id": sid,
                    "fraud_type":        "round_trip",
                    "is_fraud":          True,
                },
                {
                    "user_id":           user_id,
                    "occurred_at":       base + delay,
                    "amount_kobo":       out_amount,
                    "sender_name":       sender,   # same entity = recipient
                    "is_repeat_customer": False,
                    "type":              "outflow",
                    "fraud_scenario_id": sid,
                    "fraud_type":        "round_trip",
                    "is_fraud":          True,
                },
            ])
        return self._make_df(rows)

    # ── Scenario 5: amount_cloning ────────────────────────────────────────────

    def inject_amount_cloning(self, n_scenarios: int) -> pd.DataFrame:
        """
        Fix #1 (cloning variant): tighten to 2-4 hour window.
        Identical amounts from 4-8 novel senders in a tight window.
        """
        rows = []
        for user_id in self._pick_users(n_scenarios):
            sid           = self._scenario_id()
            base          = self._random_ts(user_id)
            amount        = self._typical_amount(user_id, scale=float(self.rng.uniform(1, 3)))
            n_txns        = int(self.rng.integers(4, 9))
            window_min    = float(self.rng.uniform(120, 240))   # 2-4 hours
            offsets       = sorted(self.rng.uniform(0, window_min, size=n_txns).tolist())

            for off in offsets:
                rows.append({
                    "user_id":           user_id,
                    "occurred_at":       base + timedelta(minutes=off),
                    "amount_kobo":       amount,
                    "sender_name":       self._novel_sender(user_id),
                    "is_repeat_customer": False,   # Fix #5
                    "type":              "inflow",
                    "fraud_scenario_id": sid,
                    "fraud_type":        "amount_cloning",
                    "is_fraud":          True,
                })
        return self._make_df(rows)

    # ── Scenario 6: dormancy_spike ────────────────────────────────────────────

    def inject_dormancy_spike(self, n_scenarios: int) -> pd.DataFrame:
        """
        Fix #2: Find users with a real 30+ day gap inside their history.
        Spike is placed at the END of an actual gap — not after the data window ends.
        """
        # Candidates: users who have at least one 30+ day internal gap
        candidates = self._user_stats[
            self._user_stats["max_gap_days"] > 30
        ].index.tolist()
        candidates = [
            u for u in candidates
            if self._user_scenario_count.get(u, 0) < self.config.max_scenarios_per_user
        ]

        rows = []
        for user_id in candidates:
            if len({r["fraud_scenario_id"] for r in rows}) >= n_scenarios:
                break

            # Find the actual gap in this user's history
            user_ts = (
                self._sorted_clean
                [self._sorted_clean["user_id"] == user_id]["occurred_at"]
                .reset_index(drop=True)
            )
            gaps_days = user_ts.diff().dt.total_seconds().div(86400)
            large_gaps = gaps_days[gaps_days > 30]
            if large_gaps.empty:
                continue

            # Pick a random large gap and place the spike at its end
            gap_idx     = int(self.rng.choice(large_gaps.index.tolist()))
            spike_start = user_ts.iloc[gap_idx]   # first txn AFTER the gap

            self._user_scenario_count[user_id] = (
                self._user_scenario_count.get(user_id, 0) + 1
            )
            sid    = self._scenario_id()
            n_txns = int(self.rng.integers(8, 16))
            offsets = sorted(self.rng.uniform(0, 23 * 60, size=n_txns).tolist())

            for off in offsets:
                use_novel = self.rng.random() < 0.5
                sender    = self._novel_sender(user_id) if use_novel else self._known_sender(user_id)
                rows.append({
                    "user_id":           user_id,
                    "occurred_at":       spike_start + timedelta(minutes=off),
                    "amount_kobo":       self._typical_amount(user_id),
                    "sender_name":       sender,
                    "is_repeat_customer": not use_novel,   # Fix #5
                    "type":              "inflow",
                    "fraud_scenario_id": sid,
                    "fraud_type":        "dormancy_spike",
                    "is_fraud":          True,
                })
        return self._make_df(rows)

    # ── Scenario 7: round_number_flood ────────────────────────────────────────

    def inject_round_number_flood(self, n_scenarios: int) -> pd.DataFrame:
        """6–12 round-kobo amounts (₦1k–₦50k) in a 2–3 hour window."""
        round_pool = [i * 100_000 for i in range(5, 51)]   # ₦1k–₦50k in steps of ₦1k

        rows = []
        for user_id in self._pick_users(n_scenarios):
            sid        = self._scenario_id()
            base       = self._random_ts(user_id)
            n_txns     = int(self.rng.integers(6, 13))
            window_min = float(self.rng.uniform(120, 180))
            offsets    = sorted(self.rng.uniform(0, window_min, size=n_txns).tolist())

            for off in offsets:
                use_novel = self.rng.random() < 0.6
                sender    = self._novel_sender(user_id) if use_novel else self._known_sender(user_id)
                rows.append({
                    "user_id":           user_id,
                    "occurred_at":       base + timedelta(minutes=off),
                    "amount_kobo":       int(self.rng.choice(round_pool)),
                    "sender_name":       sender,
                    "is_repeat_customer": not use_novel,   # Fix #5
                    "type":              "inflow",
                    "fraud_scenario_id": sid,
                    "fraud_type":        "round_number_flood",
                    "is_fraud":          True,
                })
        return self._make_df(rows)

    # ── Orchestration ─────────────────────────────────────────────────────────

    def _allocate_scenarios(self) -> dict[FraudType, int]:
        return {
            ftype: int(self.config.target_scenarios * weight)
            for ftype, weight in self.config.scenario_weights.items()
        }

    def generate_all(self) -> pd.DataFrame:
        allocation = self._allocate_scenarios()
        frames = []
        for ftype, n in allocation.items():
            print(f"  Generating {n:>4d} × {ftype}...")
            method = getattr(self, f"inject_{ftype}")
            frames.append(method(n))

        result = pd.concat(frames, ignore_index=True)
        result["occurred_at"] = pd.to_datetime(result["occurred_at"])
        return result


# ── CLI entry point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    DATA_DIR   = Path(__file__).parent.parent / "data"
    clean_path = DATA_DIR / "synth_transactions.parquet"
    out_path   = DATA_DIR / "synth_transactions_fraud.parquet"

    print(f"Loading {clean_path}...")
    clean_df = pd.read_parquet(clean_path)
    print(f"  {len(clean_df):,} rows, {clean_df['user_id'].nunique():,} users")

    injector = FraudInjector(clean_df, InjectionConfig())

    print("\nGenerating fraud scenarios...")
    fraud_df = injector.generate_all()

    print(f"\nGenerated {len(fraud_df):,} fraud rows across "
          f"{fraud_df['fraud_scenario_id'].nunique():,} scenarios")
    print("\nBy fraud_type:")
    print(fraud_df["fraud_type"].value_counts().to_string())

    # Sanity check: show one score_pump scenario laid out chronologically
    print("\nSample score_pump scenario:")
    sid = fraud_df[fraud_df["fraud_type"] == "score_pump"]["fraud_scenario_id"].iloc[0]
    print(fraud_df[fraud_df["fraud_scenario_id"] == sid]
          .sort_values("occurred_at")
          [["occurred_at", "amount_kobo", "sender_name", "is_repeat_customer"]]
          .to_string(index=False))

    fraud_df.to_parquet(out_path, index=False)
    print(f"\nSaved → {out_path}")
