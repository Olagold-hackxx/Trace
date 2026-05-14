"""
Cash-flow forecasting utilities — training-time and shared inference helpers.

Follows the same design contract as feature_engine.py:
  - Same functions used in offline training AND live lazy-fit path
  - Point-in-time correct: build_daily_series accepts an end_date cutoff
  - All money values returned in NAIRA (amount_kobo / 100)

Column contract for tx_df:
  user_id      str
  occurred_at  datetime64
  amount_kobo  int
  type         str  ('inflow' | 'outflow')
"""

import json
import logging
from pathlib import Path

import numpy as np
import pandas as pd
from prophet import Prophet

logging.getLogger("cmdstanpy").setLevel(logging.WARNING)
logging.getLogger("prophet").setLevel(logging.WARNING)

ARCHETYPE_PROFILES_PATH = Path(__file__).parent.parent / "data" / "archetype_profiles.json"

MIN_HISTORY_DAYS = 21
MIN_WEEKLY_SEASONALITY_DAYS = 28
MIN_MONTHLY_SEASONALITY_DAYS = 60


# ── Daily series ──────────────────────────────────────────────────────────────

def build_daily_series(
    tx_df: pd.DataFrame,
    user_id: str,
    end_date: pd.Timestamp | None = None,
) -> pd.DataFrame:
    """
    Aggregate a user's inflow transactions to a zero-filled daily series.

    Returns DataFrame with columns:
      ds      — datetime64[ns], one row per calendar day, no gaps
      y       — float, daily inflow in naira
      y_orig  — same as y, preserved before any log transform
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
    """log1p the y column. Call AFTER build_daily_series, BEFORE Prophet fit."""
    df = df.copy()
    df["y"] = np.log1p(df["y"])
    return df


def invert_log_transform(forecast_df: pd.DataFrame) -> pd.DataFrame:
    """Invert the log transform on Prophet's output columns."""
    forecast_df = forecast_df.copy()
    for col in ["yhat", "yhat_lower", "yhat_upper"]:
        forecast_df[col] = np.expm1(forecast_df[col])
    forecast_df["yhat_lower"] = forecast_df["yhat_lower"].clip(lower=0)
    forecast_df["yhat"] = forecast_df["yhat"].clip(lower=0)
    return forecast_df


# ── Prophet fit ───────────────────────────────────────────────────────────────

def build_eom_holidays(start: str, end: str) -> pd.DataFrame:
    """End-of-month paydays — civil servant spending bumps in Nigerian market."""
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

    daily_df  : output of build_daily_series — must have ds, y, y_orig
    forecast  : DataFrame with ds, yhat, yhat_lower, yhat_upper in NAIRA
                (log transform already inverted, lower_bound clipped ≥ 0)

    Raises ValueError when history is fewer than MIN_HISTORY_DAYS days.
    """
    n_days = len(daily_df)
    if n_days < MIN_HISTORY_DAYS:
        raise ValueError(f"Insufficient history: {n_days} days, need ≥{MIN_HISTORY_DAYS}")

    df = apply_log_transform(daily_df[["ds", "y"]])

    model = Prophet(
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10.0,
        interval_width=interval_width,
        weekly_seasonality=(n_days >= MIN_WEEKLY_SEASONALITY_DAYS),
        yearly_seasonality=False,
        daily_seasonality=False,
        holidays=custom_holidays,
    )
    if n_days >= MIN_MONTHLY_SEASONALITY_DAYS:
        model.add_seasonality(name="monthly", period=30.5, fourier_order=3)
    model.add_country_holidays(country_name="NG")

    model.fit(df)

    future = model.make_future_dataframe(periods=horizon_days, freq="D")
    raw = model.predict(future)
    forecast = invert_log_transform(raw[["ds", "yhat", "yhat_lower", "yhat_upper"]])
    return model, forecast


# ── Archetype profiles (cold-start) ──────────────────────────────────────────

def build_archetype_profiles(
    tx_df: pd.DataFrame,
    user_personas: dict[str, str],
) -> dict:
    """
    Compute mean ± std inflow by (persona, day_of_week). Run once offline.

    user_personas: {user_id: persona_name}
    """
    tx = tx_df[tx_df["type"] == "inflow"].copy()
    tx["persona"] = tx["user_id"].map(user_personas)
    tx = tx.dropna(subset=["persona"])
    tx["date"] = pd.to_datetime(tx["occurred_at"]).dt.normalize()

    daily = (
        tx.groupby(["persona", "user_id", "date"])["amount_kobo"]
        .sum()
        .reset_index()
    )
    daily["dow"] = daily["date"].dt.dayofweek  # 0=Mon … 6=Sun
    daily["amount_naira"] = daily["amount_kobo"] / 100.0

    profiles: dict = {}
    for persona, group in daily.groupby("persona"):
        stats = group.groupby("dow")["amount_naira"].agg(["mean", "std"])
        profiles[persona] = {
            "by_dow_mean": {int(k): float(v) for k, v in stats["mean"].items()},
            "by_dow_std": {
                int(k): float(v) if not np.isnan(v) else 0.0
                for k, v in stats["std"].items()
            },
        }
    return profiles


def save_archetype_profiles(
    profiles: dict,
    path: Path = ARCHETYPE_PROFILES_PATH,
) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(profiles, f)


def load_archetype_profiles(
    path: Path = ARCHETYPE_PROFILES_PATH,
) -> dict:
    with open(path) as f:
        return json.load(f)


def archetype_forecast(
    persona: str,
    horizon_days: int,
    start_date: pd.Timestamp,
    profiles: dict,
) -> pd.DataFrame:
    """
    Cold-start forecast: persona day-of-week mean ± 1.28 std (~80% interval).
    Falls back to the first available persona if the requested one is absent.
    """
    prof = profiles.get(persona) or next(iter(profiles.values()))
    rows = []
    for i in range(horizon_days):
        d = start_date + pd.Timedelta(days=i)
        dow = str(d.dayofweek)
        mu = prof["by_dow_mean"].get(dow, 0.0)
        sd = prof["by_dow_std"].get(dow, mu * 0.5)
        rows.append({
            "ds": d,
            "yhat": mu,
            "yhat_lower": max(0.0, mu - 1.28 * sd),
            "yhat_upper": mu + 1.28 * sd,
        })
    return pd.DataFrame(rows)


# ── Dip detection ─────────────────────────────────────────────────────────────

def detect_dip(
    forecast_df: pd.DataFrame,
    history_df: pd.DataFrame,
    horizon_days: int = 14,
    consecutive_days: int = 3,
    dip_fraction: float = 0.5,
) -> dict | None:
    """
    Return a dip dict when the forecast shows a sustained income dip, else None.

    forecast_df : ds, yhat, yhat_lower, yhat_upper — naira
    history_df  : ds, y — daily inflow naira for the last 60 days
    """
    if history_df.empty or len(history_df) < 30:
        return None

    baseline = float(np.percentile(history_df["y"].values, 25))
    if baseline <= 0:
        return None

    threshold = baseline * dip_fraction

    today = pd.Timestamp.utcnow().normalize().tz_localize(None)
    window = (
        forecast_df[forecast_df["ds"] >= today]
        .head(horizon_days)
        .reset_index(drop=True)
    )

    if len(window) < consecutive_days:
        return None

    window["is_dip"] = window["yhat_lower"] < threshold

    # Find the first run of ≥ consecutive_days dip days
    dip_start_idx = None
    run = 0
    for i, row in window.iterrows():
        if row["is_dip"]:
            run += 1
            if dip_start_idx is None:
                dip_start_idx = i
            if run >= consecutive_days:
                break
        else:
            run = 0
            dip_start_idx = None

    if run < consecutive_days:
        return None

    # Extend to cover the full contiguous dip block from dip_start_idx
    dip_indices = []
    for i in range(dip_start_idx, len(window)):
        if window.loc[i, "is_dip"]:
            dip_indices.append(i)
        else:
            break

    dip_df = window.loc[dip_indices]
    gap_naira = float(
        sum(max(0.0, baseline - r["yhat"]) for _, r in dip_df.iterrows())
    )
    n_dip = len(dip_df)

    return {
        "dip_start_date": dip_df["ds"].iloc[0].date(),
        "dip_end_date": dip_df["ds"].iloc[-1].date(),
        "expected_gap_kobo": int(round(gap_naira * 100)),
        "suggested_loan_kobo": size_loan(gap_naira),
        "severity": "high" if n_dip >= 7 else ("medium" if n_dip >= 5 else "low"),
    }


# ── Loan sizing ───────────────────────────────────────────────────────────────

def size_loan(gap_naira: float, kudi_score: int | None = None) -> int:
    """
    Size a micro-loan based on predicted income gap. Returns amount in kobo.

    gap_naira  : sum of daily shortfalls across the dip window
    kudi_score : optional KudiScore (300–850) used to cap the offer
    """
    raw = gap_naira * 1.20
    rounded = round(raw / 5_000) * 5_000
    amount = max(10_000, rounded)

    if kudi_score is not None:
        if kudi_score >= 750:
            cap = 500_000
        elif kudi_score >= 600:
            cap = 200_000
        elif kudi_score >= 450:
            cap = 100_000
        else:
            cap = 50_000
    else:
        cap = 200_000

    return int(min(amount, cap) * 100)  # naira → kobo
