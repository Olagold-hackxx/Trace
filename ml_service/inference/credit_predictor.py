from datetime import datetime, timezone
import numpy as np
import pandas as pd
from typing import Optional, List
from .artifact_loader import Artifact
from .feature_validator import validate_and_prepare
from .score_scaler import pd_to_score
from .fraud_predictor import FraudPredictor

# Maps feature → sub-score family
SUBSCORE_FAMILIES = {
    'cash_flow_stability': [
        'cv_weekly_revenue_90d', 'cv_daily_revenue_30d',
        'shock_days_30d', 'weekday_weekend_ratio_30d',
        'std_txn_amount_30d', 'amount_skew_30d',
    ],
    'customer_base': [
        'unique_senders_30d', 'unique_senders_90d',
        'hhi_senders_30d', 'top1_share_30d', 'top5_share_30d',
        'top10_share_30d', 'new_customer_ratio_30d',
    ],
    'growth': [
        'growth_wow', 'growth_mom', 'momentum_ratio',
        'total_inflow_7d', 'total_inflow_30d', 'total_inflow_90d',
    ],
    'reliability': [
        'txn_count_30d', 'txn_count_90d', 'active_days_30d',
        'longest_dry_spell_30d', 'days_since_last',
        'txns_per_active_day_30d', 'avg_gap_days_30d',
    ],
}

class CreditPredictor:
    def __init__(self, artifact: Artifact, shap_explainer=None, fraud_predictor=None):
        self.artifact        = artifact
        self.shap_explainer  = shap_explainer   # built lazily on first /predict/explain
        self.fraud_predictor = fraud_predictor  # FraudPredictor, loaded separately
    
    def predict(self, features: dict, transactions: Optional[List[dict]] = None) -> dict:
        df = validate_and_prepare(
            features,
            self.artifact.feature_cols,
            self.artifact.categorical_cols,
            self.artifact.known_categories,
        )
        
        raw_pd = float(self.artifact.model.predict(df)[0])
        calibrated_pd = float(self.artifact.calibrator.predict([raw_pd])[0])
        calibrated_pd = float(np.clip(calibrated_pd, 1e-6, 1 - 1e-6))
        score = pd_to_score(calibrated_pd)
        sub_scores = self._compute_sub_scores(df)
        
        # Apply fraud penalty
        fraud_penalty = 0
        if self.fraud_predictor and transactions:
            txns_df = pd.DataFrame(transactions)
            txns_df['occurred_at'] = pd.to_datetime(txns_df['occurred_at'])
            as_of = datetime.now(timezone.utc)
            fraud_penalty = self.fraud_predictor.compute_user_fraud_penalty(txns_df, as_of)
        
        adjusted_score = max(300, score - fraud_penalty)
        
        return {
            'score': adjusted_score,
            'pd': calibrated_pd,
            'sub_scores': sub_scores,
            'model_version': self.artifact.model_version,
            'computed_at': datetime.now(timezone.utc).isoformat(),
            '_features_df': df,  # internal, for explain endpoint reuse
            'fraud_penalty': fraud_penalty,
        }
    
    def _compute_sub_scores(self, df: pd.DataFrame) -> dict:
        """Compute 0-100 sub-scores via SHAP family aggregation."""
        if self.shap_explainer is None:
            # Fallback: return neutral 50s. Real sub-scores need SHAP.
            return {k: 50 for k in SUBSCORE_FAMILIES}
        
        shap_values = self.shap_explainer.shap_values(df)
        if isinstance(shap_values, list):
            shap_values = shap_values[1]  # positive class for binary
        shap_row = shap_values[0]
        
        feature_to_shap = dict(zip(self.artifact.feature_cols, shap_row))
        
        sub_scores = {}
        for family, feats in SUBSCORE_FAMILIES.items():
            family_shap = sum(feature_to_shap.get(f, 0.0) for f in feats
                              if f in feature_to_shap)
            # SHAP values are in log-odds. Negative SHAP = lowers PD = good = high sub-score.
            # Map [-2, 2] log-odds range to [0, 100] sub-score, clipped.
            sub_score = 50 - 25 * family_shap
            sub_scores[family] = int(np.clip(round(sub_score), 0, 100))
        
        return sub_scores