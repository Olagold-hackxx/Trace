"""
Fraud predictor — inference wrapper around the trained Isolation Forest.

Uses the 13-feature pipeline from fraud_feature_engine.compute_features_online.
Loaded at startup from models/fraud_model.pkl (trained offline in 04_fraud_training.ipynb).
"""

from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import pandas as pd
from sklearn.ensemble import IsolationForest

from training.fraud_feature_engine import compute_features_online
from training import fraud_model as fm

MODEL_PATH = Path(__file__).parent.parent / "models" / "fraud_model.pkl"


class FraudPredictor:
    def __init__(self, model: IsolationForest) -> None:
        self.model = model

    @classmethod
    def load(cls, path: Path = MODEL_PATH) -> "FraudPredictor":
        return cls(fm.load(path))

    def score_transaction(
        self,
        new_txn: dict,
        user_history: pd.DataFrame,
    ) -> dict:
        """
        Score one incoming transaction against the user's prior history.

        Args:
            new_txn      : dict with keys occurred_at, amount_kobo, sender_name, type
            user_history : the user's transactions BEFORE this one (30-day window)

        Returns:
            anomaly_score  float [0, 1] — higher is more anomalous
            flag           bool  — True if model marks as anomaly
            top_signals    list[str] — top-3 feature names driving the score
        """
        features = compute_features_online(new_txn, user_history)
        return fm.predict_one(self.model, features)

    def compute_credit_penalty(
        self,
        user_history: pd.DataFrame,
        as_of: Optional[datetime] = None,
    ) -> float:
        """
        Compute a fraud penalty (0–100 score points) for the credit scoring pipeline.
        Scores the user's most recent transaction and returns penalty proportional to
        its anomaly score. Used by CreditPredictor to adjust the KudiScore downward.
        """
        if user_history.empty:
            return 0.0

        hist = user_history.copy()
        hist["occurred_at"] = pd.to_datetime(hist["occurred_at"])
        hist = hist.sort_values("occurred_at")

        # Score the most recent transaction against everything before it as context
        latest = hist.iloc[-1].to_dict()
        prior  = hist.iloc[:-1]

        result = self.score_transaction(latest, prior)
        return float(result["anomaly_score"]) * 100.0
