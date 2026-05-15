import os
import pandas as pd
from datetime import datetime, timedelta, timezone

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/kudiscore",
)

# SQLAlchemy 2.x dropped the legacy 'postgres://' scheme.
# Heroku and some tools still generate that prefix — normalise it here.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def fetch_transactions(db: Session, user_id: str, as_of: datetime) -> pd.DataFrame:
    """Pull transaction history for one user, strictly before as_of.

    Normalises the backend's credit/debit type labels to inflow/outflow so
    the feature engine sees a consistent vocabulary regardless of which
    service wrote the row.
    """
    result = db.execute(
        text("""
            SELECT occurred_at, amount_kobo, sender_name,
                   CASE type
                       WHEN 'credit' THEN 'inflow'
                       WHEN 'debit'  THEN 'outflow'
                       ELSE type
                   END AS type
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
            SELECT archetype, market_name, gender, age_bracket, created_at
            FROM users
            WHERE id = :user_id
        """),
        {"user_id": user_id},
    )
    row = result.fetchone()
    if row is None:
        return {}
    return {
        "archetype": row.archetype,
        "market_location": row.market_name,
        "gender": row.gender,
        "age_bracket": row.age_bracket,
        "onboarding_date": row.created_at,
    }


def fetch_user_daily_history(
    db: Session,
    user_id: str,
    days: int = 60,
) -> pd.DataFrame:
    """Return a zero-filled daily inflow series for the last `days` calendar days.
    Columns: ds (Timestamp), y (float, naira).
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    result = db.execute(
        text("""
            SELECT DATE(occurred_at) AS ds,
                   SUM(amount_kobo)  AS total_kobo
            FROM transactions
            WHERE user_id    = :user_id
              AND type       IN ('inflow', 'credit')
              AND occurred_at >= :cutoff
            GROUP BY DATE(occurred_at)
            ORDER BY ds ASC
        """),
        {"user_id": user_id, "cutoff": cutoff},
    )
    rows = result.fetchall()
    if not rows:
        return pd.DataFrame(columns=["ds", "y"])
    df = pd.DataFrame(rows, columns=["ds", "y"])
    df["ds"] = pd.to_datetime(df["ds"])
    df["y"] = df["y"].astype(float) / 100.0
    return df


# ── Forecast cache ─────────────────────────────────────────────────────────────

def write_forecast_cache(
    db: Session,
    user_id: str,
    forecast_df: pd.DataFrame,
    model_version: str,
) -> None:
    """Upsert forecast rows. forecast_df: ds, yhat, yhat_lower, yhat_upper in NAIRA."""
    now = datetime.now(timezone.utc)
    rows = [
        {
            "user_id": user_id,
            "forecast_date": row["ds"].date(),
            "fit_at": now,
            "predicted_inflow": int(round(row["yhat"] * 100)),
            "lower_bound_80": int(round(row["yhat_lower"] * 100)),
            "upper_bound_80": int(round(row["yhat_upper"] * 100)),
            "model_version": model_version,
        }
        for _, row in forecast_df.iterrows()
    ]
    db.execute(
        text("""
            INSERT INTO forecasts
                (user_id, forecast_date, fit_at,
                 predicted_inflow, lower_bound_80, upper_bound_80, model_version)
            VALUES
                (:user_id, :forecast_date, :fit_at,
                 :predicted_inflow, :lower_bound_80, :upper_bound_80, :model_version)
            ON CONFLICT (user_id, forecast_date)
            DO UPDATE SET
                fit_at           = EXCLUDED.fit_at,
                predicted_inflow = EXCLUDED.predicted_inflow,
                lower_bound_80   = EXCLUDED.lower_bound_80,
                upper_bound_80   = EXCLUDED.upper_bound_80,
                model_version    = EXCLUDED.model_version
        """),
        rows,
    )
    db.commit()


def read_forecast_cache(
    db: Session,
    user_id: str,
    fresh_within_hours: int = 24,
) -> list[dict]:
    """Return cached forecast rows fit within the TTL window, ordered by date."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=fresh_within_hours)
    result = db.execute(
        text("""
            SELECT forecast_date, predicted_inflow, lower_bound_80,
                   upper_bound_80, model_version
            FROM forecasts
            WHERE user_id = :user_id
              AND fit_at  >= :cutoff
            ORDER BY forecast_date ASC
        """),
        {"user_id": user_id, "cutoff": cutoff},
    )
    return [dict(row._mapping) for row in result.fetchall()]
