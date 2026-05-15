"""
Seed the database with synthetic users and transactions for local testing.

Seeds 50 users + all their transactions from synth_transactions.parquet.
Safe to run multiple times — uses INSERT OR IGNORE / ON CONFLICT DO NOTHING.

Usage:
  DATABASE_URL=postgresql://user:pass@localhost:5432/trace \
    venv/bin/python scripts/seed_db.py
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
from sqlalchemy import create_engine, text

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/trace",
)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

N_USERS = 50   # seed this many users; increase if needed

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

DATA_DIR = Path(__file__).parent.parent / "data"


def seed_users(conn, users_df: pd.DataFrame) -> None:
    print(f"Seeding {len(users_df)} users...")
    rows = users_df.to_dict("records")
    conn.execute(
        text("""
            INSERT INTO users
                (user_id, archetype, market_location, gender, age_bracket, onboarded_at)
            VALUES
                (:user_id, :archetype, :market_location, :gender, :age_bracket, :onboarding_date)
            ON CONFLICT (user_id) DO NOTHING
        """),
        rows,
    )
    print(f"  ✓ {len(rows)} users inserted (duplicates skipped)")


def seed_transactions(conn, txns_df: pd.DataFrame) -> None:
    print(f"Seeding {len(txns_df):,} transactions...")
    # Batch in chunks of 5k to avoid huge single inserts
    chunk_size = 5_000
    total = 0
    for start in range(0, len(txns_df), chunk_size):
        chunk = txns_df.iloc[start : start + chunk_size].copy()
        chunk["occurred_at"] = chunk["occurred_at"].dt.strftime("%Y-%m-%d %H:%M:%S")
        rows = chunk.to_dict("records")
        conn.execute(
            text("""
                INSERT INTO transactions
                    (user_id, occurred_at, amount_kobo, sender_name, type)
                VALUES
                    (:user_id, :occurred_at, :amount_kobo, :sender_name, :type)
                ON CONFLICT DO NOTHING
            """),
            rows,
        )
        total += len(rows)
        print(f"  {total:,} / {len(txns_df):,}", end="\r")
    print(f"  ✓ {total:,} transactions inserted (duplicates skipped)")


def main() -> None:
    print(f"Connecting to {DATABASE_URL.split('@')[-1]}...")  # hide credentials

    users_df = pd.read_parquet(DATA_DIR / "synth_users.parquet")
    txns_df  = pd.read_parquet(DATA_DIR / "synth_transactions.parquet")

    # Pick N_USERS users that have the most transactions (richer history = better tests)
    top_users = (
        txns_df.groupby("user_id").size()
        .nlargest(N_USERS)
        .index.tolist()
    )

    users_df = users_df[users_df["user_id"].isin(top_users)].copy()
    txns_df  = txns_df[txns_df["user_id"].isin(top_users)].copy()

    # Rename to match DB column name
    users_df = users_df.rename(columns={"onboarding_date": "onboarding_date"})

    print(f"\nSeeding {len(users_df)} users with {len(txns_df):,} transactions...")

    with engine.begin() as conn:
        seed_users(conn, users_df)
        seed_transactions(conn, txns_df)

    print("\nDone. These user_ids are now in the DB:")
    for uid in top_users[:5]:
        n = len(txns_df[txns_df["user_id"] == uid])
        print(f"  {uid}  ({n:,} txns)")
    print(f"  ... and {len(top_users)-5} more")
    print(f"\nCopy a user_id above into the inference notebook for testing.")


if __name__ == "__main__":
    main()
