"""
Backtest cash-flow forecasts against a held-out 30-day window.

Usage:
    python -m training.cash_flow_backtest

Prints a summary table and saves data/backtest_results.csv.
Headline metrics to report:
  - Median MAE in naira
  - MAE as % of mean daily inflow
  - Median MASE (vs seasonal-naive baseline)
  - Mean 80% interval coverage
"""
import logging
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent.parent))

from training.cash_flow import (
    build_daily_series,
    build_eom_holidays,
    fit_user_forecast,
)

logger = logging.getLogger(__name__)


# ── Metrics ───────────────────────────────────────────────────────────────────

def _mae(actual, predicted):
    return float(np.mean(np.abs(predicted - actual)))


def _rmse(actual, predicted):
    return float(np.sqrt(np.mean((predicted - actual) ** 2)))


def _coverage(actual, lower, upper):
    return float(np.mean((actual >= lower) & (actual <= upper)))


def summarise(results: pd.DataFrame) -> None:
    print(f"n users           : {len(results)}")
    print(f"Median MAE        : ₦{results['mae'].median():,.0f}")
    print(f"MAE % of mean     : {results['mae_pct_of_mean'].median():.1%}")
    print(f"Median MASE       : {results['mase'].median():.3f}")
    print(f"Mean 80% coverage : {results['coverage_80'].mean():.2%}")


# ── Single-user backtest ──────────────────────────────────────────────────────

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
        _, forecast = fit_user_forecast(train, horizon_days=holdout_days, custom_holidays=holidays)
    except ValueError as exc:
        logger.debug("Skipping %s: %s", user_id, exc)
        return None

    pred = forecast.tail(holdout_days).reset_index(drop=True)
    actual = test["y_orig"].values

    yhat = pred["yhat"].values
    lo = pred["yhat_lower"].values
    hi = pred["yhat_upper"].values

    # Seasonal-naive baseline: last 7 training days tiled over the holdout
    sn_base = train["y_orig"].values[-7:]
    sn_pred = np.tile(sn_base, holdout_days // 7 + 1)[:holdout_days]
    naive_mae = _mae(actual, sn_pred)

    return {
        "user_id": user_id,
        "n_train": len(train),
        "mae": _mae(actual, yhat),
        "rmse": _rmse(actual, yhat),
        "naive_mae": naive_mae,
        "coverage_80": _coverage(actual, lo, hi),
        "mean_actual": float(actual.mean()),
    }


# ── Batch runner ──────────────────────────────────────────────────────────────

def run_backtest(
    tx_df: pd.DataFrame,
    sample_user_ids: list[str],
    holdout_days: int = 30,
    min_history_days: int = 90,
) -> pd.DataFrame:
    results = []
    for i, uid in enumerate(sample_user_ids):
        if i % 50 == 0:
            print(f"  {i}/{len(sample_user_ids)} ...")
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

    # Select users with enough inflow history
    counts = (
        tx[tx["type"] == "inflow"]
        .groupby("user_id")["occurred_at"]
        .count()
    )
    eligible = counts[counts >= 120].index.tolist()
    sample = eligible[:500]
    print(f"Running backtest on {len(sample)} users ...")

    results = run_backtest(tx, sample)
    if not results.empty:
        summarise(results)
        out = Path("data/backtest_results.csv")
        results.to_csv(out, index=False)
        print(f"\nSaved to {out}")
