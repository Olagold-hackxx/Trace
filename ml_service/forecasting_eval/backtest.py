"""
Backtest Prophet forecasts against a held-out 30-day window.

Usage:
    from forecasting_eval.backtest import run_backtest
    results = run_backtest(tx_df, sample_user_ids)

    from forecasting_eval.metrics import summarise
    summarise(results)
"""
import logging
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent.parent))

from forecasting.aggregation import build_daily_series
from forecasting.fit import build_eom_holidays, fit_user_forecast
from forecasting_eval.metrics import coverage, mae, mase, rmse, summarise

logger = logging.getLogger(__name__)


def backtest_user(
    tx_df: pd.DataFrame,
    user_id: str,
    holdout_days: int = 30,
    min_history_days: int = 90,
) -> dict | None:
    daily = build_daily_series(tx_df, user_id)
    if len(daily) < min_history_days + holdout_days:
        return None

    train = daily.iloc[:-holdout_days].copy()
    test = daily.iloc[-holdout_days:].copy()

    holidays = build_eom_holidays(
        train["ds"].min().strftime("%Y-%m-%d"),
        (test["ds"].max() + pd.Timedelta(days=30)).strftime("%Y-%m-%d"),
    )

    try:
        _, forecast = fit_user_forecast(
            train, horizon_days=holdout_days, custom_holidays=holidays
        )
    except ValueError as exc:
        logger.debug("Skipping %s: %s", user_id, exc)
        return None

    pred = forecast.tail(holdout_days).reset_index(drop=True)
    actual = test["y_orig"].values

    yhat = pred["yhat"].values
    lo = pred["yhat_lower"].values
    hi = pred["yhat_upper"].values

    # Seasonal naive: repeat last 7 training days
    sn_base = train["y_orig"].values[-7:]
    sn_pred = np.tile(sn_base, holdout_days // 7 + 1)[:holdout_days]

    return {
        "user_id": user_id,
        "n_train": len(train),
        "mae": mae(actual, yhat),
        "rmse": rmse(actual, yhat),
        "naive_mae": float(np.mean(np.abs(sn_pred - actual))),
        "coverage_80": coverage(actual, lo, hi),
        "mean_actual": float(actual.mean()),
    }


def run_backtest(
    tx_df: pd.DataFrame,
    sample_user_ids: list[str],
    holdout_days: int = 30,
    min_history_days: int = 90,
) -> pd.DataFrame:
    results = []
    for uid in sample_user_ids:
        r = backtest_user(tx_df, uid, holdout_days, min_history_days)
        if r:
            results.append(r)

    if not results:
        logger.warning("No users had enough history for backtest")
        return pd.DataFrame()

    df = pd.DataFrame(results)
    df["mase"] = df["mae"] / df["naive_mae"].replace(0, np.nan)
    df["mae_pct_of_mean"] = df["mae"] / df["mean_actual"].replace(0, np.nan)
    return df


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    tx = pd.read_parquet("data/synth_transactions.parquet")
    users = pd.read_parquet("data/synth_users.parquet")

    # Sample 500 users with enough history
    counts = tx[tx["type"] == "inflow"].groupby("user_id")["occurred_at"].count()
    eligible = counts[counts >= 120].index.tolist()
    sample = eligible[:500]

    print(f"Running backtest on {len(sample)} users ...")
    results = run_backtest(tx, sample)

    if not results.empty:
        summarise(results)
        results.to_csv("data/backtest_results.csv", index=False)
        print("Saved to data/backtest_results.csv")
