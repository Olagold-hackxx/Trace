import numpy as np
import pandas as pd


def build_daily_series(
    tx_df: pd.DataFrame,
    user_id: str,
    end_date: pd.Timestamp | None = None,
) -> pd.DataFrame:
    """
    Aggregate a user's inflow transactions to a daily series.

    tx_df must have columns: user_id, occurred_at, amount_kobo, type
    Returns DataFrame with columns:
      ds       — datetime64[ns], one row per calendar day
      y        — float, daily inflow in naira (not kobo)
      y_orig   — same as y, preserved before log transform
    """
    user_tx = tx_df[
        (tx_df["user_id"] == user_id)
        & (tx_df["type"] == "inflow")
    ].copy()

    if user_tx.empty:
        return pd.DataFrame(columns=["ds", "y", "y_orig"])

    user_tx["date"] = pd.to_datetime(user_tx["occurred_at"]).dt.normalize()
    daily = (
        user_tx.groupby("date")["amount_kobo"]
        .sum()
        .rename("y")
    )

    start = daily.index.min()
    end = end_date if end_date is not None else daily.index.max()
    full_range = pd.date_range(start=start, end=end, freq="D")
    daily = daily.reindex(full_range, fill_value=0)

    out = daily.reset_index()
    out.columns = ["ds", "y"]
    out["y"] = out["y"] / 100.0  # kobo → naira
    out["y_orig"] = out["y"]
    return out


def apply_log_transform(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["y"] = np.log1p(df["y"])
    return df


def invert_log_transform(forecast_df: pd.DataFrame) -> pd.DataFrame:
    forecast_df = forecast_df.copy()
    for col in ["yhat", "yhat_lower", "yhat_upper"]:
        forecast_df[col] = np.expm1(forecast_df[col])
    forecast_df["yhat_lower"] = forecast_df["yhat_lower"].clip(lower=0)
    forecast_df["yhat"] = forecast_df["yhat"].clip(lower=0)
    return forecast_df
