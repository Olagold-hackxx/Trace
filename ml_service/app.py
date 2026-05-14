from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
import logging

import numpy as np
import pandas as pd
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
from schemas.match import MatchRequest, MatchResponse, WorkerResult
from training.feature_engine import compute_features
# JobMatchEngine and synthetic data imports are deferred to _ensure_match_engine()
# to avoid loading torch/sentence-transformers at startup (adds 30-60s to boot time)

ARTIFACT_PATH   = Path(__file__).parent / 'models' / 'model_artifact_v1.pkl'
EMBEDDINGS_PATH = Path(__file__).parent / 'models' / 'worker_embeddings.npy'
FIXTURES_DIR    = Path(__file__).parent / 'fixtures'   # committed, not gitignored
MATCH_MODEL     = 'paraphrase-multilingual-mpnet-base-v2'

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

state = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── Credit scoring model ──────────────────────────────────────────────
    logger.info(f"Loading credit artifact from {ARTIFACT_PATH}")
    artifact = Artifact.load(ARTIFACT_PATH)
    logger.info(f"Loaded model_version={artifact.model_version}, "
                f"features={len(artifact.feature_cols)}")

    state['predictor'] = CreditPredictor(artifact, shap_explainer=None)
    state['artifact']  = artifact
    # SHAP TreeExplainer is built lazily on first /predict/explain call
    # — building it at startup blocks gunicorn workers for 30-60s on large models
    state['explainer'] = None

    # Job matching engine is loaded lazily on first /predict/match request
    state['match_engine'] = None
    state['jobs_df']      = None

    yield
    state.clear()


app = FastAPI(title="Trace ML Service", version="1.0", lifespan=lifespan)


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get('/health')
def health():
    artifact = state.get('artifact')
    engine   = state.get('match_engine')
    models_loaded = ((['credit'] if artifact else []) +
                     (['matching'] if engine else []))
    return {
        'status':       'ok' if artifact and engine else 'loading',
        'models_loaded': models_loaded,
        'versions': {
            'credit':   artifact.model_version if artifact else None,
            'matching': MATCH_MODEL if engine else None,
        },
        'metrics': artifact.training_metrics if artifact else {},
    }


# ── Credit scoring ────────────────────────────────────────────────────────────

@app.post('/predict/score', response_model=ScoreResponse)
def predict_score(req: ScoreRequest, db: Session = Depends(get_db)):
    predictor: CreditPredictor = state.get('predictor')
    if predictor is None:
        raise HTTPException(503, "Model not loaded")

    as_of = req.as_of or _now_utc()

    try:
        txns     = fetch_transactions(db, req.user_id, as_of)
        user_meta = fetch_user_meta(db, req.user_id)
        features = compute_features(txns, as_of, user_meta)
        result   = predictor.predict(features, txns.to_dict('records'))
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
    artifact: Artifact = state.get('artifact')
    if predictor is None:
        raise HTTPException(503, "Model not loaded")

    # Build SHAP explainer on first call and cache it
    if state.get('explainer') is None:
        logger.info("Building SHAP TreeExplainer (first explain request)...")
        state['explainer'] = shap.TreeExplainer(artifact.model)
        predictor.shap_explainer = state['explainer']
        logger.info("SHAP explainer ready")
    explainer = state['explainer']

    as_of = req.as_of or _now_utc()

    try:
        txns      = fetch_transactions(db, req.user_id, as_of)
        user_meta = fetch_user_meta(db, req.user_id)
        features  = compute_features(txns, as_of, user_meta)
        pred      = predictor.predict(features, txns.to_dict('records'))
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
        value    = df.iloc[0][fname]
        shap_val = float(shap_row[i])
        if abs(shap_val) < 0.01:
            continue
        feature_data.append({
            'feature': fname, 'value': value,
            'shap': shap_val, 'abs_shap': abs(shap_val),
        })

    feature_data.sort(key=lambda x: x['abs_shap'], reverse=True)
    helping = [f for f in feature_data if f['shap'] < 0][:5]
    hurting = [f for f in feature_data if f['shap'] > 0][:5]

    def to_factor(f):
        phrasing = get_phrasing(f['feature'], f['value'], f['shap'])
        delta    = shap_to_score_delta(f['shap'], pred['pd'])
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


# ── Job matching ──────────────────────────────────────────────────────────────

def _ensure_match_engine():
    """Load the job matching engine on first call and cache it in state."""
    if state.get('match_engine') is None:
        # Deferred imports — keeps torch/sentence-transformers out of startup
        from training.job_match_engine import JobMatchEngine
        from training.job_match_synthetic import load_jobs, generate_workers

        logger.info("Loading job matching engine (first match request)...")
        workers_path = FIXTURES_DIR / 'workers.json'
        workers_df = pd.read_json(workers_path) if workers_path.exists() else generate_workers(n=200)
        jobs_path = FIXTURES_DIR / 'jobs.json'
        jobs_df = pd.read_json(jobs_path) if jobs_path.exists() else load_jobs()
        engine = JobMatchEngine(model_name=MATCH_MODEL)
        engine.load_workers(workers_df, cache_path=str(EMBEDDINGS_PATH))
        state['match_engine'] = engine
        state['jobs_df']      = jobs_df
        logger.info(f"Job matching engine ready — {len(workers_df)} workers indexed")
    return state['match_engine'], state['jobs_df']


@app.post('/predict/match', response_model=MatchResponse)
def predict_match(req: MatchRequest):
    engine, jobs_df = _ensure_match_engine()
    job_rows = jobs_df[jobs_df['job_id'] == req.job_id]
    if job_rows.empty:
        raise HTTPException(404, f"job_id '{req.job_id}' not found")

    job = job_rows.iloc[0].to_dict()

    try:
        results = engine.match(job, top_k=req.top_k)
    except Exception as e:
        logger.exception("Match failed")
        raise HTTPException(500, f"Match failed: {e}")

    workers = [
        WorkerResult(
            worker_id=row['worker_id'],
            name=row['name'],
            primary_category=row.get('primary_category', ''),
            location_name=row.get('location_name', ''),
            distance_km=float(row.get('distance_km', 0)),
            daily_rate_naira=int(row.get('daily_rate_naira', 0)),
            completed_gigs=int(row.get('completed_gigs', 0)),
            kudiscore_tier=row.get('kudiscore_tier') or None,
            bvn_verified=bool(row.get('bvn_verified', False)),
            semantic_score=float(row['semantic_score']),
            location_score=float(row['location_score']),
            performance_score=float(row['performance_score']),
            rate_score=float(row['rate_score']),
            final_score=float(row['final_score']),
        )
        for _, row in results.iterrows()
    ]

    return MatchResponse(
        job_id=req.job_id,
        job_title=job['title'],
        job_location=job['location_name'],
        budget_naira=int(job['budget_naira']),
        top_workers=workers,
        model_version=MATCH_MODEL,
        computed_at=_now_utc().isoformat(),
    )
