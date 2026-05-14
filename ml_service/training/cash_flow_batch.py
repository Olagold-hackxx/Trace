"""
Nightly batch job: fit Prophet for every active user and populate the forecast cache.

Usage:
    python -m training.cash_flow_batch
"""
import logging
import sys
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
from joblib import Parallel, delayed

sys.path.insert(0, str(Path(__file__).parent.parent))

from training.cash_flow import (
    archetype_forecast,
    build_daily_series,
    build_eom_holidays,
    fit_user_forecast,
    load_archetype_profiles,
)

logger = logging.getLogger(__name__)

_HOLIDAYS = build_eom_holidays("2024-01-01", "2027-12-31")


def _fit_one_user(
    user_id: str,
    tx_df: pd.DataFrame,
    persona: str,
    archetype_profiles: dict,
) -> tuple[str, pd.DataFrame | None, str | None]:
    daily = build_daily_series(tx_df, user_id)
    if len(daily) < 21:
        forecast = archetype_forecast(
            persona, 30, pd.Timestamp.utcnow().normalize(), archetype_profiles
        )
        return user_id, forecast, "archetype-v1"
    try:
        _, forecast = fit_user_forecast(daily, horizon_days=30, custom_holidays=_HOLIDAYS)
        forecast = forecast[forecast["ds"] > daily["ds"].max()].head(30)
        return user_id, forecast, "prophet-v1"
    except Exception as exc:
        logger.warning("Fit failed for %s: %s", user_id, exc)
        return user_id, None, None


def run_nightly_batch(
    db,
    tx_df: pd.DataFrame,
    active_user_ids: list[str],
    persona_map: dict[str, str],
    archetype_profiles: dict,
    n_jobs: int = -1,
) -> int:
    """
    Fit models for active users in parallel and write results to the forecast cache.
    Returns the number of users whose forecasts were cached.

    db: SQLAlchemy Session
    """
    from db import write_forecast_cache  # avoid circular import at module level

    results = Parallel(n_jobs=n_jobs, backend="loky", verbose=0)(
        delayed(_fit_one_user)(
            uid, tx_df, persona_map.get(uid, ""), archetype_profiles
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

    logger.info("Batch complete: %d/%d users cached", cached, len(active_user_ids))
    return cached


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    from db import SessionLocal

    tx_df = pd.read_parquet("data/synth_transactions.parquet")
    users_df = pd.read_parquet("data/synth_users.parquet")
    persona_map = dict(zip(users_df["user_id"], users_df["archetype"]))
    profiles = load_archetype_profiles()

    cutoff = datetime.utcnow() - timedelta(days=7)
    recent = (
        tx_df[pd.to_datetime(tx_df["occurred_at"]) >= cutoff]["user_id"]
        .unique()
        .tolist()
    )

    with SessionLocal() as db:
        n = run_nightly_batch(db, tx_df, recent[:200], persona_map, profiles)
    print(f"Cached {n} users")
