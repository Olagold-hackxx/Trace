from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
import logging

import numpy as np
import pandas as pd
import shap
from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from db import (
    get_db, fetch_transactions, fetch_user_meta,
    fetch_job_for_match, fetch_workers_for_match, SessionLocal,
)
from inference.artifact_loader import Artifact
from inference.cash_flow_predictor import CashFlowPredictor
from inference.credit_predictor import CreditPredictor
from inference.shap_explainer import get_phrasing, shap_to_score_delta
from schemas.credit import (
    ScoreRequest, ScoreResponse, SubScores,
    ExplainRequest, ExplainResponse, FactorExplanation,
    FraudRequest, FraudResponse,
)
from schemas.fairness import FairnessReportModel
from schemas.forecast import DailyForecast, DipWarning, ForecastResponse
from schemas.match import MatchRequest, MatchResponse, WorkerResult
from training.feature_engine import compute_features
# JobMatchEngine and synthetic data imports are deferred to _ensure_match_engine()
# to avoid loading torch/sentence-transformers at startup (adds 30-60s to boot time)

ARTIFACT_PATH    = Path(__file__).parent / 'models' / 'deeper_model_artifact_v1.pkl'
EMBEDDINGS_PATH  = Path(__file__).parent / 'models' / 'worker_embeddings.npy'
FIXTURES_DIR     = Path(__file__).parent / 'fixtures'   # committed, not gitignored
AUDIT_REPORT     = Path(__file__).parent / 'results' / 'audit' / 'fairness_report.json'
AUDIT_PLOTS_DIR  = Path(__file__).parent / 'results' / 'audit' / 'plots'
MATCH_MODEL      = 'paraphrase-multilingual-mpnet-base-v2'

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

    # Fraud model — loaded lazily on first /predict/fraud call
    state['fraud_predictor'] = None

    state['predictor'] = CreditPredictor(artifact, shap_explainer=None, fraud_predictor=None)
    state['artifact']  = artifact
    # SHAP TreeExplainer is built lazily on first /predict/explain call
    # — building it at startup blocks gunicorn workers for 30-60s on large models
    state['explainer'] = None

    # Job matching engine is loaded lazily on first /predict/match request
    state['match_engine'] = None
    state['jobs_df']      = None

    # ── Cash-flow forecasting ─────────────────────────────────────────────────
    logger.info("Loading CashFlowPredictor (archetype profiles + holidays)...")
    state['cash_flow_predictor'] = CashFlowPredictor.load()
    logger.info("CashFlowPredictor ready")

    yield
    state.clear()


app = FastAPI(title="Trace ML Service", version="1.0", lifespan=lifespan)

# Serve audit PNGs at /admin/fairness/plots/<filename>
if AUDIT_PLOTS_DIR.exists():
    app.mount(
        "/admin/fairness/plots",
        StaticFiles(directory=str(AUDIT_PLOTS_DIR)),
        name="audit_plots",
    )


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


def _ensure_fraud_predictor():
    """Load the fraud model on first call and cache it."""
    if state.get('fraud_predictor') is None:
        from inference.fraud_predictor import FraudPredictor
        from pathlib import Path
        model_path = Path(__file__).parent / 'models' / 'fraud_model.pkl'
        if not model_path.exists():
            raise HTTPException(503, "Fraud model not found — run 04_fraud_training.ipynb first")
        logger.info("Loading fraud model (first /predict/fraud request)...")
        fp = FraudPredictor.load(model_path)
        state['fraud_predictor'] = fp
        # Also wire into the credit predictor so it applies the penalty there too
        state['predictor'].fraud_predictor = fp
        logger.info("Fraud model ready")
    return state['fraud_predictor']


@app.post('/predict/fraud', response_model=FraudResponse)
def predict_fraud(req: FraudRequest, db: Session = Depends(get_db)):
    """
    Score one specific transaction for fraud.

    The backend sends the transaction details inline (amount, sender, timestamp).
    We fetch this user's 30-day history from DB, compute 13 features via the
    online path, run Isolation Forest, and return the anomaly score + penalty.
    """
    fraud_predictor = _ensure_fraud_predictor()

    # Fetch the user's prior history strictly before this transaction
    try:
        user_history = fetch_transactions(db, req.user_id, req.occurred_at)
    except Exception as e:
        logger.exception("DB fetch failed for fraud")
        raise HTTPException(500, f"History fetch failed: {e}")

    new_txn = {
        "occurred_at": req.occurred_at,
        "amount_kobo": req.amount_kobo,
        "sender_name": req.sender_name,
        "type":        req.type,
    }

    try:
        result = fraud_predictor.score_transaction(new_txn, user_history)
    except Exception as e:
        logger.exception("Fraud scoring failed")
        raise HTTPException(500, f"Fraud scoring failed: {e}")

    anomaly_score = float(result["anomaly_score"])
    return FraudResponse(
        transaction_id=req.transaction_id,
        user_id=req.user_id,
        anomaly_score=anomaly_score,
        is_anomalous=bool(result["flag"]),
        top_signals=result["top_signals"],
        fraud_penalty=round(anomaly_score * 100, 2),
    )


# ── Cash-flow forecast ───────────────────────────────────────────────────────

@app.post('/predict/forecast', response_model=ForecastResponse)
def predict_forecast(
    user_id: str,
    horizon_days: int = 30,
    db: Session = Depends(get_db),
):
    predictor: CashFlowPredictor = state.get('cash_flow_predictor')
    if predictor is None:
        raise HTTPException(503, "CashFlowPredictor not loaded")

    try:
        result = predictor.predict(user_id, db, horizon_days=horizon_days)
    except Exception as e:
        logger.exception("Forecast failed for %s", user_id)
        raise HTTPException(500, f"Forecast failed: {e}")

    dip = result["dip_warning"]
    return ForecastResponse(
        user_id=result["user_id"],
        model_version=result["model_version"],
        daily=[
            DailyForecast(
                date=r["forecast_date"],
                predicted_inflow_kobo=r["predicted_inflow"],
                lower_bound_kobo=r["lower_bound_80"],
                upper_bound_kobo=r["upper_bound_80"],
            )
            for r in result["daily"]
        ],
        dip_warning=DipWarning(**dip) if dip else None,
    )


# ── Job matching ──────────────────────────────────────────────────────────────

def _ensure_match_engine():
    """Load the job matching engine on first call and cache it in state."""
    if state.get('match_engine') is None:
        from training.job_match_engine import JobMatchEngine
        from training.job_match_synthetic import generate_workers

        logger.info("Loading job matching engine (first match request)...")

        # Load fixture workers (have full gig data — lat/lng, ratings, history)
        workers_path = FIXTURES_DIR / 'workers.json'
        fixture_df = pd.read_json(workers_path) if workers_path.exists() else generate_workers(n=200)

        # Load DB users and append any not already covered by the fixture (by name)
        try:
            _db = SessionLocal()
            try:
                db_df = fetch_workers_for_match(_db)
            finally:
                _db.close()
        except Exception as e:
            logger.warning(f"Could not load workers from DB, using fixture only: {e}")
            db_df = pd.DataFrame()

        if not db_df.empty:
            fixture_names = set(fixture_df['name'].str.strip().str.lower())
            new_workers = db_df[~db_df['name'].str.strip().str.lower().isin(fixture_names)]
            if not new_workers.empty:
                workers_df = pd.concat([fixture_df, new_workers], ignore_index=True)
                logger.info(f"Merged {len(fixture_df)} fixture + {len(new_workers)} DB workers")
            else:
                workers_df = fixture_df
        else:
            workers_df = fixture_df

        engine = JobMatchEngine(model_name=MATCH_MODEL)
        engine.load_workers(workers_df, cache_path=str(EMBEDDINGS_PATH))
        state['match_engine'] = engine
        logger.info(f"Job matching engine ready — {len(workers_df)} workers indexed")

    return state['match_engine']


@app.post('/predict/match', response_model=MatchResponse)
def predict_match(req: MatchRequest, db: Session = Depends(get_db)):
    engine = _ensure_match_engine()

    # Try DB first (job_id is a UUID in the jobs table)
    job = fetch_job_for_match(db, req.job_id)

    # Fall back to fixture for legacy fixture-based job IDs (e.g. "job_demo_iya_delivery")
    if job is None:
        jobs_path = FIXTURES_DIR / 'jobs.json'
        if jobs_path.exists():
            jobs_df = pd.read_json(jobs_path)
            job_rows = jobs_df[jobs_df['job_id'] == req.job_id]
            if not job_rows.empty:
                job = job_rows.iloc[0].to_dict()

    if job is None:
        raise HTTPException(404, f"job_id '{req.job_id}' not found in database or fixtures")

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


# ── Fairness audit ────────────────────────────────────────────────────────────

@app.get('/admin/fairness', response_model=FairnessReportModel)
def get_fairness_report():
    """
    Serve the pre-computed fairness audit report.

    The report is generated offline by running:
        python -m training.fairness_audit
    or notebook 07_fairness_audit.ipynb.

    No on-demand recompute — the route serves the cached JSON artifact.
    Plots are available at /admin/fairness/plots/<filename>.
    """
    if not AUDIT_REPORT.exists():
        raise HTTPException(
            503,
            "Fairness report not found. "
            "Run `python -m training.fairness_audit` or notebook 07 first.",
        )
    try:
        return FairnessReportModel.model_validate_json(AUDIT_REPORT.read_text())
    except Exception as e:
        logger.exception("Failed to load fairness report")
        raise HTTPException(500, f"Fairness report parse error: {e}")
