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
    df = pd.DataFrame(rows or [], columns=["occurred_at", "amount_kobo", "sender_name", "type"])
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


# ── Job matching helpers ───────────────────────────────────────────────────────

# Approximate coordinates for Lagos market areas
_MARKET_COORDS: dict[str, tuple[float, float]] = {
    "Unilag":           (6.5158, 3.3940),
    "Yaba":             (6.5144, 3.3792),
    "Computer Village": (6.6018, 3.3515),
    "Ikeja":            (6.6018, 3.3515),
    "Surulere":         (6.5059, 3.3542),
    "Lekki":            (6.4281, 3.5214),
    "Mushin":           (6.5244, 3.3600),
    "Alaba":            (6.4750, 3.2940),
    "Idumota":          (6.4550, 3.3880),
    "Balogun":          (6.4537, 3.3893),
    "Agege":            (6.6194, 3.3236),
    "Oshodi":           (6.5482, 3.3527),
    "Lagos Island":     (6.4541, 3.3947),
}
_DEFAULT_COORDS = (6.5244, 3.3792)  # Lagos centre


def _coords(location: str | None) -> tuple[float, float]:
    if not location:
        return _DEFAULT_COORDS
    for key, val in _MARKET_COORDS.items():
        if key.lower() in location.lower():
            return val
    return _DEFAULT_COORDS


def fetch_job_for_match(db: Session, job_id: str) -> dict | None:
    """Return a job row shaped for the match engine, or None if not found."""
    try:
        result = db.execute(
            text("""
                SELECT id, title, category, pay_kobo, location, description
                FROM jobs
                WHERE id = :job_id AND status = 'active'
            """),
            {"job_id": job_id},
        )
        row = result.fetchone()
    except Exception:
        return None
    if row is None:
        return None
    lat, lng = _coords(row.location)
    return {
        "job_id":       str(row.id),
        "title":        row.title,
        "category":     row.category,
        "budget_naira": int(row.pay_kobo) // 100,
        "location_name": row.location,
        "location_lat":  lat,
        "location_lng":  lng,
        "description":   row.description or "",
    }


def fetch_workers_for_match(db: Session) -> pd.DataFrame:
    """Return all active trader users shaped as worker rows for the match engine."""
    result = db.execute(text("""
        SELECT
            id,
            full_name,
            archetype,
            market_name,
            bvn IS NOT NULL AS bvn_verified,
            created_at
        FROM users
        WHERE role IN ('trader', 'worker')
          AND full_name IS NOT NULL
    """))
    rows = result.fetchall()
    if not rows:
        return pd.DataFrame()

    records = []
    for row in rows:
        lat, lng = _coords(row.market_name)
        archetype = row.archetype or "general"
        records.append({
            "worker_id":             str(row.id),
            "name":                  row.full_name,
            "primary_category":      archetype,
            "secondary_categories":  [],
            "bio":                   f"{row.full_name}, {archetype.replace('_', ' ')} at {row.market_name or 'Lagos'}.",
            "skills":                [archetype],
            "location_name":         row.market_name or "Lagos",
            "location_lat":          lat,
            "location_lng":          lng,
            "service_radius_km":     15,
            "daily_rate_naira":      5000,
            "completed_gigs":        0,
            "avg_rating":            None,
            "completion_rate":       None,
            "kudiscore_tier":        None,
            "bvn_verified":          bool(row.bvn_verified),
            "days_since_last_active": 0,
            "last_active_at":        row.created_at.isoformat() if row.created_at else None,
        })
    return pd.DataFrame(records)


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
