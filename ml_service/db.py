import os
import pandas as pd
from datetime import datetime

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/trace",
)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def fetch_transactions(db: Session, user_id: str, as_of: datetime) -> pd.DataFrame:
    """Pull transaction history for one user, strictly before as_of."""
    result = db.execute(
        text("""
            SELECT occurred_at, amount_kobo, sender_name, type
            FROM transactions
            WHERE user_id = :user_id
              AND occurred_at < :as_of
            ORDER BY occurred_at
        """),
        {"user_id": user_id, "as_of": as_of},
    )
    rows = result.fetchall()
    if not rows:
        return pd.DataFrame(columns=["occurred_at", "amount_kobo", "sender_name", "type"])
    df = pd.DataFrame(rows, columns=["occurred_at", "amount_kobo", "sender_name", "type"])
    df["occurred_at"] = pd.to_datetime(df["occurred_at"], utc=True)
    return df


def fetch_user_meta(db: Session, user_id: str) -> dict:
    """Pull identity/cohort metadata for one user."""
    result = db.execute(
        text("""
            SELECT archetype, market_location, gender, age_bracket, onboarded_at
            FROM users
            WHERE user_id = :user_id
        """),
        {"user_id": user_id},
    )
    row = result.fetchone()
    if row is None:
        return {}
    return {
        "archetype": row.archetype,
        "market_location": row.market_location,
        "gender": row.gender,
        "age_bracket": row.age_bracket,
        "onboarding_date": row.onboarded_at,
    }
