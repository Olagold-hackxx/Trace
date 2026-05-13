# Trace ML Service

The ML service for Trace — an alternative credit bureau for Nigeria's informal economy. This service powers **KudiScore**, Trace's credit scoring product: it turns a trader's Squad transaction stream into a calibrated, explainable credit score.

Part of Trace (GTCO Hackathon 3.0 — Challenge 02). See the [project specification](../Trace_Project_Specification.docx) for full context.

## What this service does

Takes a feature dict computed from a user's transaction history. Returns a calibrated probability of default, a 300-850 KudiScore (FICO-equivalent range), and plain-language SHAP explanations.

The service is intentionally separate from the main backend. Model loading, SHAP computation, and the feature pipeline are heavy (~500MB of dependencies), and keeping them in a separate process means the user-facing API stays fast even if ML serving has hiccups.

## Architecture

```
Raw transaction data (in main backend)
        ↓
┌─────────────────────────┐
│ Feature engineering     │  ← ~80 features across 6 families
│ (point-in-time correct) │     Computed in main backend, sent to ML service
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ Layer 1: Classifier     │  ← LightGBM, 200 trees
│ (LightGBM)              │     Outputs raw PD in [0.014, 0.464]
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ Layer 2: Calibrator     │  ← Isotonic regression
│ (Isotonic)              │     Maps raw PD → true probability of default
└─────────────────────────┘
        ↓
┌─────────────────────────┐
│ Layer 3: Score Scaler   │  ← score = 600 - 50 × logit(pd)
│ (Logistic mapping)      │     Clipped to [300, 850]
└─────────────────────────┘
        ↓
   KudiScore (300-850) + SHAP factors → returned to backend
```

## Current state

### Done

- **Synthetic data generator** — 10,000 Lagos trader profiles across 6 archetypes (POS, okada, food vendor, beauty, tailor, electronics) with realistic transaction streams. Partially-latent risk function: observable cash-flow features drive ~65% of risk variance; latent variables (personal discipline, business health) drive the rest. This puts a Bayes-optimal upper bound on AUC, which is what we want — keeps the model honest.

- **Feature engineering pipeline** — `compute_features(transactions, as_of, user_meta)` produces ~80 features across 6 families (magnitude, velocity, stability, concentration, behavioral, identity). Point-in-time correct: the `as_of` parameter filters out transactions after that timestamp, preventing data leakage during training.

- **Train/val/test split** — Stratified by default outcome. 7,000 / 1,500 / 1,500.

- **KudiScore model training** — LightGBM binary classifier with Optuna hyperparameter tuning (30 trials).
  - Best Optuna val AUC: 0.7812 at 4 trees — but this produced raw PD range [0.08, 0.13] and 46% of users clustered at the score ceiling, unusable on stage.
  - Final model: forced to 200 trees with Trial 14's params. Trades 0.013 val AUC for raw PD range [0.014, 0.464] and 930 distinct prediction values.
  - Decision documented: usable score resolution beats peak ranking accuracy for a demo product.

- **Calibration** — Isotonic regression fit on validation set predictions. Tested against Platt scaling, which compressed too much. Calibration error within 1-2 percentage points across populated bins.

- **Score scaler** — Logistic mapping `score = 600 - 50 × logit(pd)`, clipped to [300, 850]. At PD=0.5 → 600 (FICO 'Fair' floor); at PD=0.01 → 830 (Exceptional).

- **Model artifact bundle** — Pickled to `data/model_artifact_v1.pkl`. Contains model, calibrator, feature contract, known categorical values, score scaler config, and full training metrics.

### In progress

- FastAPI service scaffold (`/health`, `/predict/score`)
- SHAP-based explainability (`/predict/explain`)
- Plain-language feature templates for the ~80 features

### Not yet built

- Fraud / anti-gaming detection (Isolation Forest on transaction-level features)
- Cash-flow forecasting (Prophet, per-user)
- Fairness audit pipeline (demographic parity, equalized odds, per-group calibration)
- Batch scoring endpoint (for the daily fairness audit job)

## Final KudiScore model metrics (test set, n=1,500)

| Metric | Value | Notes |
|---|---|---|
| ROC-AUC | 0.7551 | Below 0.78 spec target; reflects Bayes-bounded synthetic data |
| PR-AUC | 0.1866 | Positive class is 8.9% of population |
| Brier score | 0.0763 | Low; calibrator working well |
| Log loss | 0.2662 | |
| KS statistic | 0.4415 | Industry-strong (threshold for "strong" is 0.30) |
| Approval rate at PD ≤ 5% | 53.3% | Business headline number |
| Default rate among approved | 2.2% | Lenders care most about this |
| Score spread (defaulter vs non-defaulter median) | 130 points | 694 vs 824 |

### KudiScore distribution

| Band | Range | Share | Notes |
|---|---|---|---|
| Exceptional | 800-850 | 53.3% | Low-risk archetypes (POS, okada, food vendor) cluster here |
| Very Good | 740-799 | 2.8% | The bimodal gap |
| Good | 670-739 | 38.0% | Higher-risk archetypes (beauty, tailor, electronics) |
| Fair | 580-669 | 5.9% | Worst observed cases |
| Poor | 300-579 | 0.0% | Nothing in this band on the test set |

The bimodal distribution (clusters in Exceptional and Good, hole at Very Good) reflects the synthetic data's archetype-driven risk segmentation: archetype default rates range from 1.8% (okada) to 18.2% (electronics), a ~10x ratio that the model accurately picks up.

## API (planned)

```
POST /predict/score      → {user_id, features}    → {score, pd, sub_scores, model_version}
POST /predict/explain    → {user_id, features}    → {score, helping[], hurting[]}
POST /predict/fraud      → {transaction}          → {anomaly_score, flag, reason}
POST /predict/forecast   → {user_id}              → {daily, dip_warning}
GET  /health             → {status, models_loaded, versions}
GET  /fairness/report    → {metrics, plots_urls}
```

## Performance targets

| Operation | Target | Reason |
|---|---|---|
| Single prediction | <50ms p95 | Live UX must feel instant |
| SHAP for single user | <100ms p95 | Acceptable for an explain button |
| Fraud check per transaction | <20ms p95 | Runs in webhook hot path |
| Batch score (fairness audit) | <60s for 1,000 users | Daily admin job |

## Directory layout

```
ml_service/
├── README.md                              ← this file
├── app.py                                 ← FastAPI app + lifespan loader
├── inference/
│   ├── artifact_loader.py                 ← loads + validates the pickle bundle
│   ├── feature_validator.py               ← validates incoming feature dicts
│   ├── credit_predictor.py                ← inference pipeline (KudiScore)
│   ├── score_scaler.py                    ← pd_to_score / pd_to_score_batch
│   └── shap_explainer.py                  ← SHAP templates + score-delta math
├── schemas/
│   └── credit.py                          ← Pydantic request/response models
├── training/
│   ├── synth_data_gen.py                  ← 10k Lagos trader simulator
│   ├── feature_engine.py                  ← compute_features()
│   └── notebooks/                         ← training + tuning notebooks
└── data/
    ├── synth_users.parquet                ← generated user profiles
    ├── synth_transactions.parquet         ← generated transaction stream
    ├── features_v1.parquet                ← computed feature matrix
    └── model_artifact_v1.pkl              ← the bundle the service loads
```

## Running locally (placeholder)

This section will be filled in once the FastAPI scaffold is built. Expected:

```bash
cd ml_service
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

## Model artifact bundle

The pickled artifact at `data/model_artifact_v1.pkl` contains everything the service needs at startup:

```python
{
    'model': <LightGBM Booster>,             # the trained classifier
    'calibrator': <IsotonicRegression>,      # raw PD → true PD
    'feature_cols': [...],                   # ordered list, must match exactly
    'categorical_cols': [...],               # subset of feature_cols
    'known_categories': {...},               # for unknown-value handling at inference
    'score_scaler': {                        # locked configuration
        'intercept': 600,
        'slope': -50,
        'min_score': 300,
        'max_score': 850,
    },
    'model_version': 'v1.0',
    'training_metrics': {...},
    'training_notes': '...',                 # context for future debugging
    'best_params': {...},                    # for reproducibility
    'training_date': '...',
}
```

## Key design decisions

**Why LightGBM, not deep learning.** Tabular data with ~10k examples is the home turf of gradient boosting. Deep networks overfit at this scale (Shwartz-Ziv & Armon 2022). LightGBM also handles categorical features natively (no one-hot encoding) and integrates cleanly with SHAP.

**Why isotonic calibration over Platt.** Isotonic preserves Brier score better on this data. Platt scaling compressed our raw PD range too much — the smooth logistic curve squeezed our [0.01, 0.46] range into [0.06, 0.23], breaking score resolution.

**Why we forced the model deeper than the Optuna optimum.** The Optuna best (4 trees, val AUC 0.78) had brittle probability resolution — 46% of users got the same minimum PD, the same score ceiling. At 200 trees, val AUC dropped to 0.75 but we got 930 distinct prediction values and a 130-point spread between defaulter and non-defaulter medians. Demo-quality resolution matters more than the last percentage of ranking accuracy.

**Why the score is 600 - 50 × logit(pd).** Logit-based mappings handle the extreme ends of probability better than linear ones (a 0.1% PD vs 1% PD compresses to nearly identical scores under linear scaling, which is wrong — those are very different risks). The intercept of 600 puts PD=0.5 at the FICO 'Fair' floor; the slope of 50 prevents excessive clustering at the 850 ceiling.

**Why partially-latent risk in the synthetic data.** Observable cash-flow features drive ~65% of default risk; latent variables (discipline, business health) drive the rest. This caps Bayes-optimal AUC around 0.80-0.83, which is realistic — production credit models on real bureau data hit 0.85-0.88 with much richer feature spaces and longer histories.

## Naming

- **Trace** — the platform. Squad-integrated virtual accounts, transaction ingestion, lender dashboard, and the suite of ML systems that sit on top.
- **KudiScore** — the credit scoring product within Trace. The 300-850 score, calibrated PD, and SHAP-based explanations.

A user has a Trace account; a Trace account produces a KudiScore.

## Known limitations

- Synthetic training data, not production traffic. The model has never seen real informal-economy transactions outside the Squad sandbox.
- The bimodal KudiScore distribution is a faithful reflection of the synthetic archetypes' risk spread, not a smooth real-world population.
- The model is bounded by what cash-flow features can predict. Half of default risk in our synthetic data is genuinely unobservable — this is by design, but it means production performance will depend on what observable signals we can layer in (bureau data, device signals, social graph, etc.).
- Test ROC-AUC of 0.755 is below the spec target of 0.78. The trade-off is documented in `training_notes` of the artifact.