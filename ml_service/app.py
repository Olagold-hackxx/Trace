from contextlib import asynccontextmanager
from pathlib import Path
import logging

from fastapi import FastAPI, HTTPException
import shap

from inference.artifact_loader import Artifact
from inference.credit_predictor import CreditPredictor
from schemas.credit import ScoreRequest, ScoreResponse, SubScores, ExplainRequest, ExplainResponse, FactorExplanation
from inference.shap_explainer import FEATURE_TEMPLATES, get_phrasing, shap_to_score_delta
import numpy as np
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
def predict_score(req: ScoreRequest):
    predictor: CreditPredictor = state.get('predictor')
    if predictor is None:
        raise HTTPException(503, "Model not loaded")
    try:
        transactions = [t.dict() for t in req.transactions] if req.transactions else None
        result = predictor.predict(req.features, transactions)
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
def predict_explain(req: ExplainRequest):
    predictor: CreditPredictor = state.get('predictor')
    explainer = state.get('explainer')
    artifact: Artifact = state.get('artifact')
    if predictor is None or explainer is None:
        raise HTTPException(503, "Model not loaded")
    
    # Get prediction + features
    pred = predictor.predict(req.features)
    df = pred.pop('_features_df')
    
    # Compute SHAP
    shap_values = explainer.shap_values(df)
    if isinstance(shap_values, list):
        shap_values = shap_values[1]
    shap_row = shap_values[0]
    
    # Pair feature names with values and SHAPs
    feature_data = []
    for i, fname in enumerate(artifact.feature_cols):
        value = df.iloc[0][fname]
        shap_val = float(shap_row[i])
        # Skip near-zero contributors
        if abs(shap_val) < 0.01:
            continue
        feature_data.append({
            'feature': fname,
            'value': value,
            'shap': shap_val,
            'abs_shap': abs(shap_val),
        })
    
    # Sort by absolute impact
    feature_data.sort(key=lambda x: x['abs_shap'], reverse=True)
    
    # Split into positive (helps score) and negative (hurts score)
    # SHAP negative = lowers PD = score UP = positive for user
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