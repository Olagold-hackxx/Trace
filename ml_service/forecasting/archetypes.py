import json
from pathlib import Path

import numpy as np
import pandas as pd

ARCHETYPE_PROFILES_PATH = Path(__file__).parent.parent / "data" / "archetype_profiles.json"


def build_archetype_profiles(
    tx_df: pd.DataFrame,
    user_personas: dict[str, str],
) -> dict:
    """
    Compute mean inflow by (persona, day_of_week). Run once offline.

    tx_df: has columns user_id, occurred_at, amount_kobo, type
    user_personas: user_id -> persona/archetype name
    """
    tx_df = tx_df[tx_df["type"] == "inflow"].copy()
    tx_df["persona"] = tx_df["user_id"].map(user_personas)
    tx_df = tx_df.dropna(subset=["persona"])
    tx_df["date"] = pd.to_datetime(tx_df["occurred_at"]).dt.normalize()

    daily = (
        tx_df.groupby(["persona", "user_id", "date"])["amount_kobo"]
        .sum()
        .reset_index()
    )
    daily["dow"] = daily["date"].dt.dayofweek  # 0=Mon..6=Sun
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


def save_archetype_profiles(profiles: dict, path: Path = ARCHETYPE_PROFILES_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(profiles, f)


def load_archetype_profiles(path: Path = ARCHETYPE_PROFILES_PATH) -> dict:
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
    Falls back to the first available persona if the requested one is missing.
    """
    prof = profiles.get(persona) or next(iter(profiles.values()))
    rows = []
    for i in range(horizon_days):
        d = start_date + pd.Timedelta(days=i)
        dow = d.dayofweek
        mu = prof["by_dow_mean"].get(str(dow), 0.0)
        sd = prof["by_dow_std"].get(str(dow), mu * 0.5)
        rows.append({
            "ds": d,
            "yhat": mu,
            "yhat_lower": max(0.0, mu - 1.28 * sd),
            "yhat_upper": mu + 1.28 * sd,
        })
    return pd.DataFrame(rows)
