from datetime import datetime, timedelta

import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session


def write_forecast_cache(
    db: Session,
    user_id: str,
    forecast_df: pd.DataFrame,
    model_version: str,
) -> None:
    """
    Upsert forecast rows into the forecasts table.
    forecast_df must have columns: ds, yhat, yhat_lower, yhat_upper — values in NAIRA.
    """
    now = datetime.utcnow()
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
            INSERT INTO forecasts (user_id, forecast_date, fit_at,
                                   predicted_inflow, lower_bound_80, upper_bound_80,
                                   model_version)
            VALUES (:user_id, :forecast_date, :fit_at,
                    :predicted_inflow, :lower_bound_80, :upper_bound_80,
                    :model_version)
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
    """
    Return cached forecast rows that were fit within the TTL window.
    Each row: forecast_date, predicted_inflow, lower_bound_80, upper_bound_80, model_version.
    """
    cutoff = datetime.utcnow() - timedelta(hours=fresh_within_hours)
    result = db.execute(
        text("""
            SELECT forecast_date, predicted_inflow, lower_bound_80, upper_bound_80,
                   model_version
            FROM forecasts
            WHERE user_id = :user_id
              AND fit_at  >= :cutoff
            ORDER BY forecast_date ASC
        """),
        {"user_id": user_id, "cutoff": cutoff},
    )
    return [dict(row._mapping) for row in result.fetchall()]


def fetch_user_daily_history(
    db: Session,
    user_id: str,
    days: int = 60,
) -> pd.DataFrame:
    """
    Return a daily inflow series for the last `days` calendar days.
    Columns: ds (date), y (naira).
    """
    result = db.execute(
        text("""
            SELECT DATE(occurred_at) AS ds,
                   SUM(amount_kobo)  AS total_kobo
            FROM transactions
            WHERE user_id    = :user_id
              AND type       = 'inflow'
              AND occurred_at >= NOW() - INTERVAL ':days days'
            GROUP BY DATE(occurred_at)
            ORDER BY ds ASC
        """),
        {"user_id": user_id, "days": days},
    )
    rows = result.fetchall()
    if not rows:
        return pd.DataFrame(columns=["ds", "y"])
    df = pd.DataFrame(rows, columns=["ds", "y"])
    df["ds"] = pd.to_datetime(df["ds"])
    df["y"] = df["y"].astype(float) / 100.0
    return df
