from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
import logging

import numpy as np
import shap
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session

from db import get_db, fetch_transactions, fetch_user_meta
from inference.artifact_loader import Artifact
from inference.credit_predictor import CreditPredictor
from inference.shap_explainer import get_phrasing, shap_to_score_delta
from schemas.credit import (
    ScoreRequest, ScoreResponse, SubScores,
    ExplainRequest, ExplainResponse, FactorExplanation,
    FraudRequest, FraudResponse,
)
from training.feature_engine import compute_features

ARTIFACT_PATH = Path(__file__).parent / 'models' / 'model_artifact_v1.pkl'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Loading artifact from {ARTIFACT_PATH}")
    artifact = Artifact.load(ARTIFACT_PATH)
    logger.info(f"Loaded model_version={artifact.model_version}, "
                f"features={len(artifact.feature_cols)}")

    logger.info("Building SHAP TreeExplainer...")
    explainer = shap.TreeExplainer(artifact.model)
    logger.info("SHAP explainer ready")

    state['predictor'] = CreditPredictor(artifact, shap_explainer=explainer)
    state['artifact'] = artifact
    state['explainer'] = explainer

    yield
    state.clear()


app = FastAPI(title="KudiScore ML Service", version="1.0", lifespan=lifespan)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


@app.get('/health')
def health():
    artifact = state.get('artifact')
    return {
        'status': 'ok' if artifact else 'loading',
        'models_loaded': ['credit'] if artifact else [],
        'versions': {'credit': artifact.model_version} if artifact else {},
        'metrics': artifact.training_metrics if artifact else {},
    }


@app.post('/predict/score', response_model=ScoreResponse)
def predict_score(req: ScoreRequest, db: Session = Depends(get_db)):
    predictor: CreditPredictor = state.get('predictor')
    if predictor is None:
        raise HTTPException(503, "Model not loaded")

    as_of = req.as_of or _now_utc()

    try:
        txns = fetch_transactions(db, req.user_id, as_of)
        user_meta = fetch_user_meta(db, req.user_id)
        features = compute_features(txns, as_of, user_meta)
        result = predictor.predict(features, txns.to_dict('records'))
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(500, f"Prediction failed: {e}")

    return ScoreResponse(
        user_id=req.user_id,
        score=result['score'],
        pd=result['pd'],
        sub_scores=SubScores(**result['sub_scores']),
        model_version=result['model_version'],
        computed_at=result['computed_at'],
    )


@app.post('/predict/explain', response_model=ExplainResponse)
def predict_explain(req: ExplainRequest, db: Session = Depends(get_db)):
    predictor: CreditPredictor = state.get('predictor')
    explainer = state.get('explainer')
    artifact: Artifact = state.get('artifact')
    if predictor is None or explainer is None:
        raise HTTPException(503, "Model not loaded")

    as_of = req.as_of or _now_utc()

    try:
        txns = fetch_transactions(db, req.user_id, as_of)
        user_meta = fetch_user_meta(db, req.user_id)
        features = compute_features(txns, as_of, user_meta)
        pred = predictor.predict(features, txns.to_dict('records'))
    except Exception as e:
        logger.exception("Explain failed")
        raise HTTPException(500, f"Explain failed: {e}")

    df = pred.pop('_features_df')

    shap_values = explainer.shap_values(df)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]
    shap_row = shap_values[0]

    feature_data = []
    for i, fname in enumerate(artifact.feature_cols):
        value = df.iloc[0][fname]
        shap_val = float(shap_row[i])
        if abs(shap_val) < 0.01:
            continue
        feature_data.append({
            'feature': fname,
            'value': value,
            'shap': shap_val,
            'abs_shap': abs(shap_val),
        })

    feature_data.sort(key=lambda x: x['abs_shap'], reverse=True)
    helping = [f for f in feature_data if f['shap'] < 0][:5]
    hurting = [f for f in feature_data if f['shap'] > 0][:5]

    def to_factor(f):
        phrasing = get_phrasing(f['feature'], f['value'], f['shap'])
        delta = shap_to_score_delta(f['shap'], pred['pd'])
        return FactorExplanation(
            feature=f['feature'],
            value=str(f['value']),
            phrasing=phrasing or f"{f['feature']} = {f['value']}",
            score_delta=delta,
        )

    return ExplainResponse(
        user_id=req.user_id,
        score=pred['score'],
        pd=pred['pd'],
        helping=[to_factor(f) for f in helping],
        hurting=[to_factor(f) for f in hurting],
        model_version=pred['model_version'],
    )


@app.post('/predict/fraud', response_model=FraudResponse)
def predict_fraud(req: FraudRequest, db: Session = Depends(get_db)):
    predictor: CreditPredictor = state.get('predictor')
    if predictor is None:
        raise HTTPException(503, "Model not loaded")
    if predictor.fraud_predictor is None:
        raise HTTPException(503, "Fraud model not loaded")

    as_of = _now_utc()

    try:
        txns = fetch_transactions(db, req.user_id, as_of)
        if txns.empty:
            return FraudResponse(
                transaction_id=req.transaction_id,
                user_id=req.user_id,
                fraud_penalty=0.0,
                anomaly_score=0.0,
                is_anomalous=False,
            )

        penalty = predictor.fraud_predictor.compute_user_fraud_penalty(txns, as_of)
        anomaly_score = float(penalty / 100)
        return FraudResponse(
            transaction_id=req.transaction_id,
            user_id=req.user_id,
            fraud_penalty=float(penalty),
            anomaly_score=anomaly_score,
            is_anomalous=anomaly_score > 0.5,
        )
    except Exception as e:
        logger.exception("Fraud detection failed")
        raise HTTPException(500, f"Fraud detection failed: {e}")
