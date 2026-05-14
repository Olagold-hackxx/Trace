"""
Nightly batch job: fit Prophet for every active user and cache results.

Usage:
    from forecasting.batch import run_nightly_batch
    run_nightly_batch(session, tx_df, active_user_ids, persona_map, archetype_profiles)

Or run standalone:
    python -m forecasting.batch
"""
import logging
from datetime import datetime, timedelta

import pandas as pd
from joblib import Parallel, delayed
from sqlalchemy.orm import Session

from .aggregation import build_daily_series
from .archetypes import archetype_forecast, load_archetype_profiles
from .cache import write_forecast_cache
from .fit import build_eom_holidays, fit_user_forecast

logger = logging.getLogger(__name__)


def _fit_one_user(
    user_id: str,
    tx_df: pd.DataFrame,
    persona: str,
    archetype_profiles: dict,
    holidays: pd.DataFrame,
) -> tuple[str, pd.DataFrame | None, str | None]:
    daily = build_daily_series(tx_df, user_id)
    if len(daily) < 21:
        forecast = archetype_forecast(
            persona, 30, pd.Timestamp.utcnow().normalize(), archetype_profiles
        )
        return user_id, forecast, "archetype-v1"
    try:
        _, forecast = fit_user_forecast(daily, horizon_days=30, custom_holidays=holidays)
        forecast = forecast[forecast["ds"] > daily["ds"].max()].head(30)
        return user_id, forecast, "prophet-v1"
    except Exception as exc:
        logger.warning("Fit failed for %s: %s", user_id, exc)
        return user_id, None, None


def run_nightly_batch(
    db: Session,
    tx_df: pd.DataFrame,
    active_user_ids: list[str],
    persona_map: dict[str, str],
    archetype_profiles: dict,
    n_jobs: int = -1,
) -> int:
    """Fit models for all active users. Returns number of users cached."""
    holidays = build_eom_holidays("2024-01-01", "2027-12-31")

    results = Parallel(n_jobs=n_jobs, backend="loky", verbose=0)(
        delayed(_fit_one_user)(
            uid, tx_df, persona_map.get(uid, ""), archetype_profiles, holidays
        )
        for uid in active_user_ids
    )

    cached = 0
    for user_id, forecast, version in results:
        if forecast is not None and not forecast.empty:
            try:
                write_forecast_cache(db, user_id, forecast, version)
                cached += 1
            except Exception as exc:
                logger.error("Cache write failed for %s: %s", user_id, exc)

    logger.info("Nightly batch complete: %d/%d users cached", cached, len(active_user_ids))
    return cached


def get_active_user_ids(db: Session, days: int = 7) -> list[str]:
    """Users who had at least one transaction in the last `days` days."""
    from sqlalchemy import text
    result = db.execute(
        text("""
            SELECT DISTINCT user_id FROM transactions
            WHERE occurred_at >= NOW() - INTERVAL ':days days'
        """),
        {"days": days},
    )
    return [row[0] for row in result.fetchall()]


if __name__ == "__main__":
    import sys
    from pathlib import Path

    sys.path.insert(0, str(Path(__file__).parent.parent))

    from db import SessionLocal
    from forecasting.archetypes import load_archetype_profiles

    logging.basicConfig(level=logging.INFO)

    tx_df = pd.read_parquet("data/synth_transactions.parquet")
    users_df = pd.read_parquet("data/synth_users.parquet")
    persona_map = dict(zip(users_df["user_id"], users_df["archetype"]))
    profiles = load_archetype_profiles()

    cutoff = datetime.utcnow() - timedelta(days=7)
    recent_users = tx_df[pd.to_datetime(tx_df["occurred_at"]) >= cutoff]["user_id"].unique().tolist()

    with SessionLocal() as db:
        n = run_nightly_batch(db, tx_df, recent_users[:200], persona_map, profiles)
    print(f"Cached {n} users")
