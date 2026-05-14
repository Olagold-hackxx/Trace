import logging

import pandas as pd
from prophet import Prophet

from .aggregation import apply_log_transform, invert_log_transform

logging.getLogger("cmdstanpy").setLevel(logging.WARNING)
logging.getLogger("prophet").setLevel(logging.WARNING)


def build_eom_holidays(start: str, end: str) -> pd.DataFrame:
    """End-of-month paydays — civil servant spending bumps."""
    dates = pd.date_range(start, end, freq="ME")
    return pd.DataFrame({
        "holiday": "end_of_month_payday",
        "ds": dates,
        "lower_window": 0,
        "upper_window": 2,
    })


def fit_user_forecast(
    daily_df: pd.DataFrame,
    horizon_days: int = 30,
    interval_width: float = 0.80,
    custom_holidays: pd.DataFrame | None = None,
) -> tuple[Prophet, pd.DataFrame]:
    """
    Fit Prophet on a user's daily series and return (model, forecast).

    daily_df: output of build_daily_series — must have ds, y, y_orig columns.
    forecast: DataFrame with ds, yhat, yhat_lower, yhat_upper in NAIRA,
              log transform already inverted.

    Raises ValueError when history is fewer than 21 days.
    """
    n_days = len(daily_df)
    if n_days < 21:
        raise ValueError(f"Insufficient history: {n_days} days, need ≥21")

    weekly = n_days >= 28

    df = apply_log_transform(daily_df[["ds", "y"]])

    model = Prophet(
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10.0,
        interval_width=interval_width,
        weekly_seasonality=weekly,
        yearly_seasonality=False,
        daily_seasonality=False,
        holidays=custom_holidays,
    )
    if n_days >= 60:
        model.add_seasonality(name="monthly", period=30.5, fourier_order=3)
    model.add_country_holidays(country_name="NG")

    model.fit(df)

    future = model.make_future_dataframe(periods=horizon_days, freq="D")
    raw_forecast = model.predict(future)
    forecast = invert_log_transform(
        raw_forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]]
    )
    return model, forecast
