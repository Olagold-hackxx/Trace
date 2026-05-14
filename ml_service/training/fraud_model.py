"""
Isolation Forest fraud detection model.

Training: fit on 13 features from the union of clean + injected fraud transactions.
          The model is UNSUPERVISED — is_fraud labels are NOT passed to fit().
          Labels are used only for evaluation (precision@K, per-scenario recall).

Inference: score one transaction's pre-computed features in <5ms.

Feature contract: FraudFeatures.FEATURE_NAMES (13 features, computed by
                  fraud_feature_engine.compute_features_batch / compute_features_online).
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

from training.fraud_feature_engine import FraudFeatures

FEATURE_NAMES = FraudFeatures.FEATURE_NAMES
MODEL_PATH    = Path(__file__).parent.parent / "models" / "fraud_model.pkl"


# ─── Config ──────────────────────────────────────────────────────────────────

@dataclass
class TrainConfig:
    # 0.5% contamination = ~7× actual fraud rate. Gives the model headroom
    # to also flag genuinely weird-but-clean transactions.
    contamination: float = 0.005
    n_estimators: int    = 200
    # 256 is sklearn default; large enough for 13-feature space on 22M rows.
    max_samples: int      = 256
    random_state: int     = 42
    n_jobs: int           = -1


# ─── Training ─────────────────────────────────────────────────────────────────

def train(features_df: pd.DataFrame, config: TrainConfig = TrainConfig()) -> IsolationForest:
    """
    Fit Isolation Forest on the 13-feature matrix.
    Does NOT use is_fraud labels — unsupervised by design.
    """
    X = features_df[FEATURE_NAMES].fillna(0).values
    model = IsolationForest(
        contamination=config.contamination,
        n_estimators=config.n_estimators,
        max_samples=config.max_samples,
        random_state=config.random_state,
        n_jobs=config.n_jobs,
    )
    model.fit(X)
    return model


# ─── Inference ────────────────────────────────────────────────────────────────

def score_samples(model: IsolationForest, features_df: pd.DataFrame) -> np.ndarray:
    """
    Return anomaly scores in [0, 1] — higher = more anomalous.
    sklearn.score_samples returns negative values (less negative = more normal),
    so we flip the sign and rescale using the training percentiles.
    """
    X   = features_df[FEATURE_NAMES].fillna(0).values
    raw = -model.score_samples(X)   # flip: higher = more anomalous
    # Percentile-normalise to [0, 1] so callers get a stable scale
    p5, p95 = np.percentile(raw, [5, 95])
    span = max(p95 - p5, 1e-6)
    return np.clip((raw - p5) / span, 0.0, 1.0)


def predict_one(model: IsolationForest, features: dict[str, float]) -> dict:
    """
    Score one transaction. Accepts a pre-computed feature dict.
    Returns anomaly_score (0-1), flag (bool), and the top-3 driving features.
    """
    row = pd.DataFrame([features])
    score = float(score_samples(model, row)[0])
    flag  = model.predict(row[FEATURE_NAMES].fillna(0).values)[0] == -1

    # Top-3 features driving the anomaly (highest absolute deviation from 0)
    top_features = sorted(
        [(k, abs(v)) for k, v in features.items() if k in FEATURE_NAMES],
        key=lambda x: x[1], reverse=True,
    )[:3]

    return {
        "anomaly_score": score,
        "flag":          flag,
        "top_signals":   [k for k, _ in top_features],
    }


# ─── Evaluation ──────────────────────────────────────────────────────────────

def evaluate(
    model: IsolationForest,
    features_df: pd.DataFrame,
    top_k: int = 1000,
) -> dict:
    """
    Evaluate on a labelled feature DataFrame (must have 'is_fraud' and 'fraud_type').

    Returns:
      - score_distribution: describe() of raw anomaly scores
      - precision_at_k: fraction of top-k anomalies that are fraud
      - recall_by_scenario: per fraud_type recall in the top-k
      - auc_approx: approximate area under precision-recall curve
    """
    df = features_df.copy()
    df["_score"] = score_samples(model, df)
    df["_raw"]   = -model.score_samples(df[FEATURE_NAMES].fillna(0).values)
    df["_label"] = df["is_fraud"].astype(bool)

    top_k = min(top_k, len(df))
    top   = df.nlargest(top_k, "_score")

    precision_at_k = float(top["_label"].mean())

    recall_by_scenario: dict[str, float] = {}
    if "fraud_type" in df.columns:
        for ftype, group in df[df["_label"]].groupby("fraud_type"):
            n_fraud = len(group)
            n_caught = top[top.get("fraud_type", pd.Series()) == ftype].shape[0]
            recall_by_scenario[ftype] = round(n_caught / n_fraud, 3) if n_fraud else 0.0

    # Approximate AUC-PR using 10 thresholds
    thresholds = np.linspace(df["_score"].max(), df["_score"].min(), 10)
    prec, rec  = [], []
    for t in thresholds:
        pred = df["_score"] >= t
        tp   = (pred & df["_label"]).sum()
        fp   = (pred & ~df["_label"]).sum()
        fn   = (~pred & df["_label"]).sum()
        prec.append(tp / max(tp + fp, 1))
        rec.append(tp  / max(tp + fn, 1))
    auc_approx = float(np.trapz(prec, rec)) if len(rec) > 1 else 0.0

    return {
        "score_distribution":  df["_score"].describe().round(4).to_dict(),
        "precision_at_1000":   precision_at_k,
        "recall_by_scenario":  recall_by_scenario,
        "auc_pr_approx":       round(abs(auc_approx), 4),
    }


# ─── Persistence ─────────────────────────────────────────────────────────────

def save(model: IsolationForest, path: Path = MODEL_PATH) -> None:
    path.parent.mkdir(exist_ok=True)
    joblib.dump(model, path)
    print(f"Fraud model saved → {path}")


def load(path: Path = MODEL_PATH) -> IsolationForest:
    return joblib.load(path)
