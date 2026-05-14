import numpy as np
import pandas as pd

from .loan_sizing import size_loan


def detect_dip(
    forecast_df: pd.DataFrame,
    history_df: pd.DataFrame,
    horizon_days: int = 14,
    consecutive_days: int = 3,
    dip_fraction: float = 0.5,
) -> dict | None:
    """
    Return a dip dict if the forecast shows a sustained income dip, else None.

    forecast_df: columns ds, yhat, yhat_lower, yhat_upper — values in NAIRA
    history_df:  columns ds, y — daily inflow in NAIRA for the last 60 days
    """
    if history_df.empty or len(history_df) < 30:
        return None

    baseline = float(np.percentile(history_df["y"].values, 25))
    if baseline <= 0:
        return None

    threshold = baseline * dip_fraction

    today = pd.Timestamp.utcnow().normalize().tz_localize(None)
    window = forecast_df[forecast_df["ds"] >= today].head(horizon_days).reset_index(drop=True)

    if len(window) < consecutive_days:
        return None

    window["is_dip"] = window["yhat_lower"] < threshold

    # Locate the first run of consecutive_days or more dip days
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

    # Extend to cover the full contiguous dip block starting at dip_start_idx
    dip_rows = []
    for i in range(dip_start_idx, len(window)):
        if window.loc[i, "is_dip"]:
            dip_rows.append(i)
        else:
            break

    dip_df = window.loc[dip_rows]
    dip_start = dip_df["ds"].iloc[0]
    dip_end = dip_df["ds"].iloc[-1]

    gap_naira = float(
        sum(max(0.0, baseline - r["yhat"]) for _, r in dip_df.iterrows())
    )

    n_dip = len(dip_df)
    severity = "high" if n_dip >= 7 else ("medium" if n_dip >= 5 else "low")

    return {
        "dip_start_date": dip_start.date(),
        "dip_end_date": dip_end.date(),
        "expected_gap_kobo": int(round(gap_naira * 100)),
        "suggested_loan_kobo": size_loan(gap_naira),
        "severity": severity,
    }
