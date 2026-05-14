"""
FastAPI router for cash-flow forecast endpoints.
Register in app.py: app.include_router(forecast_router, prefix="/predict")
"""
import logging
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db, fetch_transactions
from forecasting.aggregation import build_daily_series
from forecasting.archetypes import archetype_forecast, load_archetype_profiles
from forecasting.cache import fetch_user_daily_history, read_forecast_cache, write_forecast_cache
from forecasting.detect import detect_dip
from forecasting.fit import build_eom_holidays, fit_user_forecast
from schemas.forecast import DailyForecast, DipWarning, ForecastResponse

logger = logging.getLogger(__name__)
forecast_router = APIRouter()

_ARCHETYPE_PROFILES: dict = {}
_EOM_HOLIDAYS: pd.DataFrame | None = None


def _holidays() -> pd.DataFrame:
    global _EOM_HOLIDAYS
    if _EOM_HOLIDAYS is None:
        _EOM_HOLIDAYS = build_eom_holidays("2024-01-01", "2027-12-31")
    return _EOM_HOLIDAYS


def init_forecast_state() -> None:
    """Call from app lifespan to pre-load archetype profiles."""
    global _ARCHETYPE_PROFILES
    profiles_path = Path(__file__).parent.parent / "data" / "archetype_profiles.json"
    if profiles_path.exists():
        _ARCHETYPE_PROFILES = load_archetype_profiles(profiles_path)
        logger.info("Loaded %d archetype profiles", len(_ARCHETYPE_PROFILES))
    else:
        logger.warning(
            "archetype_profiles.json not found at %s — cold-start fallback unavailable",
            profiles_path,
        )


def _lazy_fit(
    user_id: str,
    db: Session,
    horizon_days: int,
) -> tuple[pd.DataFrame, str]:
    """Fit on demand for users not covered by the nightly batch."""
    from datetime import datetime, timezone
    as_of = datetime.now(timezone.utc)
    tx_raw = fetch_transactions(db, user_id, as_of)

    # fetch_transactions returns type column — build compatible df
    tx_df = tx_raw.rename(columns={"occurred_at": "occurred_at"})
    tx_df["user_id"] = user_id

    daily = build_daily_series(tx_df, user_id)

    if len(daily) < 21:
        if not _ARCHETYPE_PROFILES:
            raise HTTPException(503, "Archetype profiles not loaded and insufficient history")
        # Best-effort persona lookup from DB
        from db import fetch_user_meta
        meta = fetch_user_meta(db, user_id)
        persona = meta.get("archetype", next(iter(_ARCHETYPE_PROFILES)))
        start = pd.Timestamp.utcnow().normalize().tz_localize(None)
        forecast = archetype_forecast(persona, horizon_days, start, _ARCHETYPE_PROFILES)
        return forecast, "archetype-v1"

    _, forecast = fit_user_forecast(daily, horizon_days, custom_holidays=_holidays())
    forecast = forecast[forecast["ds"] > daily["ds"].max()].head(horizon_days)
    return forecast, "prophet-v1"


@forecast_router.post("/forecast", response_model=ForecastResponse)
def get_forecast(
    user_id: str,
    horizon_days: int = 30,
    db: Session = Depends(get_db),
):
    # TTL: active users cached for 24h, lazy-fit users for 7d
    cached = read_forecast_cache(db, user_id, fresh_within_hours=24)

    if not cached:
        try:
            forecast_df, version = _lazy_fit(user_id, db, horizon_days)
            write_forecast_cache(db, user_id, forecast_df, version)
            cached = read_forecast_cache(db, user_id, fresh_within_hours=24)
        except HTTPException:
            raise
        except Exception as exc:
            logger.exception("Lazy fit failed for %s", user_id)
            raise HTTPException(500, f"Forecast failed: {exc}") from exc
    else:
        version = cached[0]["model_version"]

    if not cached:
        raise HTTPException(500, "No forecast available after fit")

    # Build dip warning from cached forecast + recent transaction history
    forecast_for_dip = pd.DataFrame([
        {
            "ds": pd.Timestamp(r["forecast_date"]),
            "yhat": r["predicted_inflow"] / 100.0,
            "yhat_lower": r["lower_bound_80"] / 100.0,
            "yhat_upper": r["upper_bound_80"] / 100.0,
        }
        for r in cached
    ])

    try:
        history = fetch_user_daily_history(db, user_id, days=60)
    except Exception:
        history = pd.DataFrame(columns=["ds", "y"])

    dip = detect_dip(forecast_for_dip, history)

    return ForecastResponse(
        user_id=user_id,
        model_version=version,
        daily=[
            DailyForecast(
                date=r["forecast_date"],
                predicted_inflow_kobo=r["predicted_inflow"],
                lower_bound_kobo=r["lower_bound_80"],
                upper_bound_kobo=r["upper_bound_80"],
            )
            for r in cached
        ],
        dip_warning=DipWarning(**dip) if dip else None,
    )
