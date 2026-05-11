"""
Fraud detection using Isolation Forest on transaction-level features.
"""

from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from training.fraud_feature_engine import compute_transaction_features, aggregate_user_fraud_score


class FraudPredictor:
    def __init__(self, isolation_forest: IsolationForest, feature_cols: List[str]):
        self.model = isolation_forest
        self.feature_cols = feature_cols

    @classmethod
    def train(cls, transaction_data: pd.DataFrame, contamination: float = 0.1):
        """
        Train Isolation Forest on transaction features.

        Args:
            transaction_data: DataFrame with transaction features
            contamination: Expected proportion of anomalies
        """
        features = transaction_data[cls.get_feature_cols()]
        model = IsolationForest(contamination=contamination, random_state=42)
        model.fit(features)
        return cls(model, cls.get_feature_cols())

    @staticmethod
    def get_feature_cols() -> List[str]:
        return [
            'amount_z_score', 'time_of_day_rarity', 'sender_novelty',
            'velocity', 'reciprocity', 'round_amount_pattern'
        ]

    def predict_transaction_anomalies(self, transaction_features: pd.DataFrame) -> pd.DataFrame:
        """
        Predict anomaly scores for transactions.

        Returns DataFrame with anomaly_score column added.
        """
        features = transaction_features[self.feature_cols]
        # Isolation Forest returns -1 for anomalies, 1 for normal
        # Convert to anomaly score: higher = more anomalous
        scores = self.model.decision_function(features)
        # decision_function returns negative for anomalies, positive for normal
        # Convert to 0-1 scale where 1 is most anomalous
        anomaly_scores = -scores  # flip sign
        anomaly_scores = (anomaly_scores - anomaly_scores.min()) / (anomaly_scores.max() - anomaly_scores.min())
        transaction_features = transaction_features.copy()
        transaction_features['anomaly_score'] = anomaly_scores
        return transaction_features

    def compute_user_fraud_penalty(self, txns: pd.DataFrame, as_of: datetime) -> float:
        """
        Compute fraud penalty for a user based on their transactions.

        Returns penalty value to subtract from KudiScore.
        """
        transaction_features = compute_transaction_features(txns, as_of)
        if len(transaction_features) == 0:
            return 0.0

        transaction_features = self.predict_transaction_anomalies(transaction_features)

        # Aggregate anomaly scores
        avg_anomaly = transaction_features['anomaly_score'].mean()

        # Assume P(fraud) is the average anomaly score
        p_fraud = avg_anomaly

        # Penalty = anomaly_score * (1 - 0.5 * P(fraud))
        # But since anomaly_score is avg, and p_fraud is avg, perhaps use max or something
        # For simplicity, use the max anomaly score
        max_anomaly = transaction_features['anomaly_score'].max()
        penalty = max_anomaly * (1 - 0.5 * p_fraud)

        # Scale to score points (e.g., max penalty 100 points)
        penalty_points = penalty * 100

        return penalty_points