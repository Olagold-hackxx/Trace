"""
CashFlowPredictor — serving-time wrapper for cash-flow forecasting.

Mirrors the CreditPredictor / FraudPredictor pattern:
  - Initialised once at startup (archetype profiles + holiday table)
  - predict() is the single public method called by the /predict/forecast route
  - All heavy work (Prophet fit) runs synchronously; FastAPI threadpools handle concurrency
"""
import logging
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

from training.cash_flow import (
    archetype_forecast,
    build_daily_series,
    build_eom_holidays,
    detect_dip,
    fit_user_forecast,
    load_archetype_profiles,
)

logger = logging.getLogger(__name__)


class CashFlowPredictor:
    def __init__(
        self,
        archetype_profiles: dict,
        holidays: pd.DataFrame,
    ):
        self.archetype_profiles = archetype_profiles
        self.holidays = holidays

    @classmethod
    def load(
        cls,
        profiles_path: Path | None = None,
        holidays_start: str = "2024-01-01",
        holidays_end: str = "2027-12-31",
    ) -> "CashFlowPredictor":
        """Load from disk. Called once in the FastAPI lifespan."""
        if profiles_path is None:
            profiles_path = Path(__file__).parent.parent / "data" / "archetype_profiles.json"

        if profiles_path.exists():
            profiles = load_archetype_profiles(profiles_path)
            logger.info("Loaded %d archetype profiles", len(profiles))
        else:
            profiles = {}
            logger.warning(
                "archetype_profiles.json not found at %s — cold-start archetype "
                "fallback unavailable",
                profiles_path,
            )

        holidays = build_eom_holidays(holidays_start, holidays_end)
        return cls(archetype_profiles=profiles, holidays=holidays)

    # ── Public interface ───────────────────────────────────────────────────────

    def predict(
        self,
        user_id: str,
        db,
        horizon_days: int = 30,
        fresh_within_hours: int = 24,
    ) -> dict:
        """
        Return a forecast dict for the given user.

        Cache-first: if a fresh forecast exists in the DB it is returned
        immediately. Otherwise a lazy fit is performed and cached.

        Returns:
            {
              "user_id": str,
              "model_version": str,
              "daily": [{"forecast_date", "predicted_inflow", "lower_bound_80", "upper_bound_80"}, ...],
              "dip_warning": dict | None,
            }
        """
        from db import read_forecast_cache, write_forecast_cache, fetch_user_daily_history

        cached = read_forecast_cache(db, user_id, fresh_within_hours=fresh_within_hours)

        if not cached:
            forecast_df, version = self._lazy_fit(user_id, db, horizon_days)
            write_forecast_cache(db, user_id, forecast_df, version)
            cached = read_forecast_cache(db, user_id, fresh_within_hours=fresh_within_hours)
        else:
            version = cached[0]["model_version"]

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

        return {
            "user_id": user_id,
            "model_version": version,
            "daily": cached,
            "dip_warning": dip,
        }

    # ── Private helpers ────────────────────────────────────────────────────────

    def _lazy_fit(
        self,
        user_id: str,
        db,
        horizon_days: int,
    ) -> tuple[pd.DataFrame, str]:
        """Fit on demand for users not covered by the nightly batch."""
        from db import fetch_transactions, fetch_user_meta

        as_of = datetime.now(timezone.utc)
        tx_raw = fetch_transactions(db, user_id, as_of)
        tx_raw = tx_raw.copy()
        tx_raw["user_id"] = user_id

        daily = build_daily_series(tx_raw, user_id)

        if len(daily) < 21:
            meta = fetch_user_meta(db, user_id)
            persona = meta.get("archetype", next(iter(self.archetype_profiles), ""))
            start = pd.Timestamp.utcnow().normalize().tz_localize(None)
            forecast = archetype_forecast(persona, horizon_days, start, self.archetype_profiles)
            return forecast, "archetype-v1"

        _, forecast = fit_user_forecast(daily, horizon_days, custom_holidays=self.holidays)
        forecast = forecast[forecast["ds"] > daily["ds"].max()].head(horizon_days)
        return forecast, "prophet-v1"
