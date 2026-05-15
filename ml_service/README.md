# Trace ML Service

The ML layer for **Trace** — an alternative credit bureau for Nigeria's informal economy built on Squad transaction data. Five ML systems, one FastAPI service, zero bureau data required.

Part of Trace (GTCO Hackathon 3.0 — Challenge 02).

---

## The five systems

| System | What it does | Model family |
|---|---|---|
| [KudiScore](#1-kudiscore-credit-model) | Creditworthiness score (300–850) from transaction history | LightGBM + isotonic calibration |
| [Fraud detection](#2-fraud-detection) | Anomaly score on incoming transactions | Isolation Forest |
| [Cash-flow forecasting](#3-cash-flow-forecasting) | 30-day daily inflow forecast + dip warning | Prophet (per-user) |
| [Job matching](#4-job-matching) | Rank workers against a job description | Sentence-transformer bi-encoder |
| [Fairness audit](#5-fairness-audit) | Per-group equity metrics on the credit model | Bootstrapped MetricFrame |

---

## 1. KudiScore Credit Model

### What it does

Takes a trader's 6-month transaction history and outputs a 300–850 score (same range as FICO), a calibrated probability of default, and plain-language SHAP explanations of the top factors helping or hurting that score.

### Feature engineering

`compute_features(transactions, as_of, user_meta)` produces 42 features across six families:

| Family | Examples |
|---|---|
| Magnitude | `total_inflow_30d`, `mean_txn_amount_30d` |
| Velocity | `txn_count_7d`, `active_days_30d`, `longest_dry_spell_30d` |
| Stability | `cv_weekly_revenue_90d`, `revenue_growth_mom`, `momentum_ratio` |
| Concentration | `hhi_senders_30d`, `top1_share_30d`, `new_customer_ratio_30d` |
| Behavioral | `hour_entropy_30d`, `amount_skewness_30d`, `mean_intertxn_seconds_30d` |
| Identity | `archetype`, `market_location`, `days_since_onboarding` |

The `as_of` cutoff is non-negotiable: every window calculation excludes transactions after `as_of`, making the pipeline point-in-time correct and safe to use in backtesting without data leakage.

### Model

**LightGBM binary classifier** — gradient-boosted decision trees, the standard choice for tabular credit data. Deep networks overfit at this scale (~10k users); LightGBM handles categoricals natively and integrates cleanly with SHAP.

Training used Optuna (30 trials, TPE sampler) to tune `num_leaves`, `max_depth`, learning rate, regularization, and feature/bagging fractions. The Optuna best (4 trees, val AUC 0.781) had a raw PD range of [0.08, 0.13] — 46% of users landed at the same minimum score, which is useless. The production model is forced to 200 trees with the Optuna-tuned regularization: val AUC drops to 0.755 but PD range opens to [0.014, 0.464] with 930 distinct values and a 130-point spread between defaulter and non-defaulter medians. Score resolution matters more than the last 0.02 AUC for a demo product.

### Calibration

**Isotonic regression** fit on validation set predictions. Platt scaling was tried and rejected — its smooth logistic curve compressed the [0.014, 0.464] raw range into [0.06, 0.23], destroying resolution. Isotonic is unconstrained (monotone, not parametric) and preserves the full PD range.

### Score scaling

```
KudiScore = clip(600 - 50 × logit(pd), 300, 850)
```

Logit-based rather than linear because the extremes of probability space need to be well-separated. Under a linear map, PD=0.1% and PD=1% produce nearly identical scores despite representing very different risks. The logit stretches low-PD differences out. The intercept (600) places PD=0.5 at the FICO "Fair" floor.

### SHAP explanations

`shap.TreeExplainer` on the LightGBM booster. For each prediction, SHAP values are computed per feature and decomposed into two lists: features *helping* the score (negative SHAP = lower PD = better) and features *hurting* it. Each is translated into a plain-language phrase and converted to a score-delta via `shap_to_score_delta(shap_val, pd)`.

The TreeExplainer is built lazily on the first `/predict/explain` call and cached — it takes 30–60s on first build but is instant thereafter.

### Metrics (test set, n=1,500)

| Metric | Value |
|---|---|
| ROC-AUC | 0.755 |
| Brier score | 0.076 |
| KS statistic | 0.442 |
| Approval rate (PD ≤ 5%) | 53.3% |
| Default rate among approved | 2.2% |
| Defaulter / non-defaulter median spread | 130 points (694 vs 824) |

KS of 0.44 is strong — industry threshold for "strong separation" is 0.30. AUC of 0.755 is below the spec target of 0.78; the gap is explained by the partially-latent synthetic risk function (half of default risk is intentionally unobservable, capping Bayes-optimal AUC around 0.80–0.83).

---

## 2. Fraud Detection

### What it does

Scores every incoming transaction for anomaly and returns a penalty that is subtracted from the KudiScore. A 15× spike from a novel sender, a burst of round-number transfers, or a rapid-fire velocity cluster all push the score higher.

### Why unsupervised

In production, labelled fraud examples are rare and stale by the time they're collected. Isolation Forest detects structural anomalies without needing labels — it isolates points that require fewer random splits to separate from the rest of the data. Training *doesn't use the `is_fraud` flag*; that label is injected afterward for evaluation only.

### Features

13 per-transaction features computed using only prior transactions for that user (point-in-time correct):

| Family | Features |
|---|---|
| Amount | `amount_zscore_user`, `log_ratio_to_median`, `round_amount_flag` |
| Velocity | `txn_count_1h`, `txn_count_6h` |
| Timing | `seconds_since_last`, `hour_rarity`, `dow_rarity` |
| Sender | `sender_novelty`, `days_since_first_seen`, `sender_concentration_24h` |
| Cross-sender | `exact_amount_match_24h`, `reciprocity` |

DuckDB interval self-joins handle the time-windowed counts efficiently — a standard pandas groupby on 22M rows for each transaction would be unusable.

### Training data

7 fraud scenario types injected by `FraudInjector` into the clean 22.7M-row dataset:

| Scenario | Share | Signature |
|---|---|---|
| Score pump | 35% | Burst of novel senders to inflate credit features |
| Large novel deposit | 20% | Single 10–25× deposit from unseen sender |
| Velocity known sender | 15% | 10–20 transactions from one sender in 1 hour |
| Round trip | 10% | Inflow immediately reversed as outflow |
| Amount cloning | 10% | Same exact amount from 4–8 different senders |
| Dormancy spike | 5% | Silent user suddenly floods transactions |
| Round number flood | 5% | Flood of suspiciously round kobo amounts |

Amounts and timings are calibrated to each user's own baseline so fraud looks plausible within each user's scale, not just globally.

### Evaluation

Precision@1000 (of the 1,000 highest-scored transactions, what fraction are labelled fraud?) against a random baseline of 0.07% (the actual fraud rate). Per-scenario recall@1000 identifies which fraud types the model catches and which need better features.

### Scoring

At inference, `compute_user_fraud_penalty` runs the Isolation Forest on the last 30 days of transactions, takes the max anomaly score, scales it to [0, 100], and the KudiScore is reduced by that penalty: `adjusted_score = max(300, credit_score - fraud_penalty)`.

---

## 3. Cash-Flow Forecasting

### What it does

Fits a time-series model on each user's daily inflow history and forecasts the next 30 days. If the forecast shows a sustained income dip — three or more consecutive days where even the lower bound of the interval falls below 50% of the user's recent average — it sizes a micro-loan offer to bridge the gap.

### Model: Prophet

Facebook Prophet is a decomposable additive model: `y(t) = trend(t) + seasonality(t) + holidays(t) + ε`. It handles the Nigerian market well because it natively supports:

- **Custom holidays** — NG public holidays via `add_country_holidays("NG")` plus end-of-month payday bumps (civil servant spending spikes on the last working day of each month)
- **Multiple seasonalities** — weekly (enabled at ≥28 days of history), monthly (enabled at ≥60 days, Fourier order 3)

One model is fit per user — there is no shared model across users. This is the right choice for highly heterogeneous populations (an okada rider's weekly inflow pattern is nothing like a beauty supplier's).

### Transforms

Daily inflow is log1p-transformed before fitting. Raw naira amounts are right-skewed (a few large market days dominate the distribution), and Prophet's additive error structure assumes approximately Gaussian residuals. The log transform symmetrises the distribution and prevents the model from over-weighting large days. All outputs are expm1-inverted and clipped to zero before returning.

### Cold-start

Users with fewer than 21 days of history can't be meaningfully fit with Prophet. Instead, they get a day-of-week archetype baseline: mean ± std inflow per (archetype, day-of-week) computed from all users of the same archetype, providing an 80% interval as mean ± 1.28σ. This profile is trained once offline and saved as `models/cash_flow_artifact_v1.pkl`.

### Dip detection and loan sizing

```
baseline     = P25(user's daily inflow, last 60 days)
threshold    = baseline × 0.5
dip          = ≥3 consecutive forecast days where yhat_lower < threshold
gap_naira    = Σ max(0, baseline − yhat) over dip days
loan_amount  = round(gap_naira × 1.20 / 5,000) × 5,000
loan_amount  = max(₦10,000, min(loan_amount, KudiScore-tier cap))
```

`yhat_lower` (the pessimistic bound of the 80% interval) triggers the offer rather than `yhat` — an offer only fires when even the optimistic scenario looks bad. Loan caps by KudiScore tier: ₦50k (< 450), ₦100k (450–600), ₦200k (600–750), ₦500k (> 750).

### Serving

The nightly batch (`training/cash_flow_batch.py`) pre-fits the top active users in parallel using joblib and caches forecast rows in the `forecasts` DB table. The API is cache-first: if a fresh forecast exists (fit within the last 24 hours), it's returned immediately. For users not covered by the batch, a lazy fit runs at request time (~2–5s). Cold-start users fall through to the archetype profile instantly.

---

## 4. Job Matching

### What it does

Given a job posting, ranks a pool of workers by a combination of semantic similarity, location proximity, performance history, and rate compatibility.

### Model: sentence-transformer bi-encoder

`paraphrase-multilingual-mpnet-base-v2` (768-dimensional embeddings, 50 languages including Nigerian Pidgin). Job descriptions and worker profiles are independently encoded into embedding vectors; similarity is cosine distance in that shared space.

Why a bi-encoder rather than a cross-encoder? Cross-encoders are more accurate but require a forward pass for every job-worker pair — O(J × W) at query time. Bi-encoders encode workers once at index time, then job similarity is a single matrix multiply — O(W) regardless of job count. Worker embeddings are pre-computed and saved to `models/worker_embeddings.npy`, loaded once at startup.

### Reranker

After semantic shortlisting, a four-factor weighted reranker adjusts the final score:

| Factor | Signal | Weight |
|---|---|---|
| Semantic | Cosine similarity from bi-encoder | 0.40 |
| Location | Haversine distance, exponential decay | 0.30 |
| Performance | Completed gigs, KudiScore tier, BVN verified | 0.20 |
| Rate | Worker daily rate vs job budget | 0.10 |

The reranker is deliberately simple — it encodes real business constraints (proximity matters in Lagos traffic; workers charging 3× budget should rank lower regardless of semantic fit) without the complexity of a learned reranker that would require click/hire data we don't have.

### Multilingual capability

A Pidgin job post ("make we find person wey go do am") matches workers with English-language bios because the model's multilingual embedding space aligns cross-lingual representations. This is the central value proposition for the Lagos informal-economy context.

---

## 5. Fairness Audit

### What it does

Checks whether the KudiScore model applies different standards to different groups of people. "Different standards" here has a specific meaning: differences in approval rate, true-positive rate, false-positive rate, or calibration accuracy that *aren't explained by differences in creditworthiness*.

### Why this matters

The credit model uses features derived from transaction behaviour — velocity, regularity, customer diversity. These features correlate with business archetype and market location, which in turn correlate with demographic attributes. A model can discriminate indirectly even when it never looks at gender or location directly. The audit measures whether this is happening.

### Metrics and methodology

For each protected attribute (gender, market location, age bracket), the audit computes per-group:

| Metric | Definition |
|---|---|
| Selection rate | Fraction of group approved (PD ≤ 5%) |
| TPR | Of actual defaulters, fraction correctly denied |
| FPR | Of actual non-defaulters, fraction incorrectly denied |
| Brier score | Mean squared error of predicted PD vs actual default |

Each metric comes with an **80% bootstrap confidence interval** (1,000 unstratified resamples). Unstratified resampling is deliberate — it reflects real deployment uncertainty where group proportions vary, not just within-group sampling noise.

**Disparity metrics** summarise across groups:

- **Demographic parity difference** — max approval rate minus min approval rate across groups
- **Equalized odds difference** — worst-case pair across max(|TPR gap|, |FPR gap|); this is a worst-case measure, not an average
- **Max calibration gap** — max per-group Brier minus min per-group Brier

**Flag thresholds** (set before looking at results — the frozen `AuditConfig`):
- DP difference > 10%
- EO difference > 10%
- Calibration gap > 5pp

These are conventional values from the fairness literature, not tuned to the findings.

### Findings (synthetic data, n=1,500 test set)

| Attribute | DP diff | EO diff | Cal gap | Flags |
|---|---|---|---|---|
| gender | 0.05 | 0.07 | 0.02 | None |
| market_location | **0.17** | **0.29** | **0.06** | 3 |
| age_bracket | **0.13** | **0.18** | 0.03 | 2 |

Market location shows the largest disparities: traders in some Lagos markets are approved at nearly 30pp higher rates than traders in others, and the equalized odds gap reaches 29pp. This reflects the synthetic data generator's archetype-to-market mapping (electronics retailers cluster in certain markets and have much higher default rates), but in production this pattern would warrant investigation before deployment.

### Intersectional analysis

Gender × market location cells are computed separately. Cells with n < 30 are reported but excluded from flagging — their CIs are too wide to distinguish real disparity from sampling noise. This is called the **small-cell rule** and is standard practice in algorithmic fairness audits.

### Proxy analysis

For every model feature × protected attribute pair, the audit computes:
- **Cramér's V** for categorical feature × categorical attribute (e.g., `archetype` × `market_location`)
- **η² (eta-squared)** for continuous feature × categorical attribute (e.g., `txn_count_30d` × `gender`)

Flag thresholds: Cramér's V ≥ 0.20 (Cramér 1946), η² ≥ 0.06 (Cohen 1988 "medium effect"). These are cited conventional cutoffs — same principle as the disparity thresholds: locked before inspection.

Transaction velocity and timing features show moderate association with market location, explaining how the model can produce market-correlated outcomes even without a market feature in the direct prediction path.

### Synthetic data caveat

The audit's synthetic data has **equal base rates across groups by construction**. Any disparity found is therefore a model artefact, not a reflection of real-world economic differences. This is the right setup for testing model behaviour in isolation — but it means the audit understates the complexity of production deployment, where base-rate differences between demographics exist due to historical economic factors. Re-run on real data before production.

---

## API

All endpoints are served by the single FastAPI process.

```
GET  /health                          Model status and loaded versions
POST /predict/score                   KudiScore + calibrated PD + sub-scores
POST /predict/explain                 KudiScore + top-5 SHAP factors (plain language)
POST /predict/fraud                   Anomaly score for one incoming transaction
POST /predict/forecast                30-day daily inflow forecast + dip warning
POST /predict/match                   Ranked worker shortlist for a job posting
GET  /admin/fairness                  Full fairness audit report (JSON)
GET  /admin/fairness/plots/{file}     Calibration and disparity plot PNGs
```

The credit, fraud, and forecast endpoints require a live DB with seeded transaction data. The match and fairness endpoints serve from pre-computed artifacts and need no DB.

---

## Notebooks

| Notebook | What it covers |
|---|---|
| `01_feature_engineering` | Feature families, single-user smoke test, batch computation |
| `02_training_model` | Split, LightGBM training, Optuna tuning, calibration, scoring |
| `03_inference` | End-to-end API tests for all 8 endpoints |
| `04_fraud_training` | Fraud injection, 13-feature pipeline, Isolation Forest, evaluation |
| `05_job_match_training` | Embedding, reranker, multilingual test cases |
| `06_cash_flow_forecasting` | Daily aggregation, Prophet fit, backtest, dip detection, loan sizing |
| `07_fairness_audit` | Per-group metrics, calibration plots, intersectional heatmap, proxy table |

---

## Directory layout

```
ml_service/
├── app.py                        FastAPI app — all routes, lifespan loader
├── db.py                         SQLAlchemy session, all DB helpers
│
├── inference/
│   ├── artifact_loader.py        Loads + validates the credit model pickle
│   ├── credit_predictor.py       KudiScore inference (LightGBM + calibrator + SHAP)
│   ├── fraud_predictor.py        Isolation Forest inference + penalty computation
│   ├── cash_flow_predictor.py    CashFlowPredictor — cache-first, lazy Prophet fit
│   ├── feature_validator.py      Feature dict validation at request time
│   ├── score_scaler.py           pd_to_score() — logit mapping
│   └── shap_explainer.py         SHAP phrasing templates + score-delta math
│
├── training/
│   ├── synthetic_data_gen.py     10k Lagos trader simulator (6 archetypes)
│   ├── feature_engine.py         compute_features() — 42 features, point-in-time correct
│   ├── fraud_feature_engine.py   13 transaction-level fraud features (DuckDB)
│   ├── fraud_injector.py         7 fraud scenario types, calibrated to user baselines
│   ├── fraud_model.py            Isolation Forest training, evaluation, save/load
│   ├── job_match_engine.py       Bi-encoder + four-factor reranker
│   ├── job_match_synthetic.py    Synthetic job and worker profiles
│   ├── cash_flow.py              Daily aggregation, Prophet fit, archetypes, dip detection
│   ├── cash_flow_batch.py        Nightly parallel batch fitter
│   ├── cash_flow_backtest.py     30-day holdout evaluation
│   └── fairness_audit.py         AuditConfig, per-group metrics, proxy analysis, plots
│
├── schemas/
│   ├── credit.py                 Pydantic request/response models for credit endpoints
│   ├── forecast.py               Pydantic models for forecast endpoint
│   ├── match.py                  Pydantic models for match endpoint
│   └── fairness.py               Dataclasses (audit output) + Pydantic mirrors (API)
│
├── models/
│   ├── deeper_model_artifact_v1.pkl   Credit model bundle (LightGBM + calibrator)
│   ├── fraud_model.pkl                Isolation Forest
│   ├── cash_flow_artifact_v1.pkl      Archetype profiles (cash-flow cold-start)
│   └── worker_embeddings.npy          Pre-computed 768-dim worker embeddings
│
├── data/
│   ├── synth_users.parquet            10k user profiles
│   ├── synth_transactions.parquet     22.7M transactions
│   ├── synth_transactions_fraud.parquet  Clean + injected fraud union
│   ├── features_v1.parquet            Computed feature matrix (all users)
│   ├── splits.parquet                 Train/val/test assignments (random_state=42)
│   └── synth_labels.parquet           Default outcomes (0/1)
│
├── results/
│   └── audit/
│       ├── fairness_report.json       Full audit output (served by /admin/fairness)
│       └── plots/                     Calibration + disparity PNGs
│
├── migrations/
│   ├── 002_forecasting_tables.sql     forecasts + dip_warnings tables
│   └── (future) 003_fairness_reports.sql
│
└── notebooks/                         See table above
```

---

## Running locally

```bash
cd ml_service
pip install -r requirements.txt

# Start the server
DATABASE_URL=postgresql://user:pass@host:5432/trace \
  uvicorn app:app --reload --port 8001

# Seed the DB with synthetic data (first time only)
DATABASE_URL=postgresql://user:pass@host:5432/trace \
  python scripts/seed_db.py

# Run the fairness audit (generates results/audit/fairness_report.json)
python -m training.fairness_audit

# Run the cash-flow nightly batch
python -m training.cash_flow_batch
```

---

## Key design decisions

**One Prophet model per user, not a global model.** A single shared Prophet model would average away the heterogeneity that makes the forecasts useful — an okada rider's daily inflow pattern (peaks on Fridays, drops on rainy days) looks nothing like a beauty supplier's (steady weekday income, Saturday spike). The marginal compute cost of per-user fitting is managed by the nightly batch and DB cache.

**Isolation Forest over a supervised classifier for fraud.** Labelled fraud examples are sparse and stale — by the time a case is confirmed fraud, the pattern has already changed. Isolation Forest detects structural anomalies without label dependency. The evaluation uses injected fraud scenarios with known labels, but the model itself trains unsupervised on clean data.

**Bootstrapped CIs on fairness metrics, not just point estimates.** A DP difference of 0.17 is meaningless without knowing whether that's 0.17 ± 0.02 (real signal) or 0.17 ± 0.15 (sampling noise on a small group). Unstratified bootstrap resamples the full population — not each group independently — so the CIs reflect deployment uncertainty including natural group-mix variation.

**Frozen fairness thresholds.** `AuditConfig` is `frozen=True` and thresholds are set before any results are inspected. This is the "we didn't tune to the answer" evidence that responsible-AI reviewers look for. The thresholds are conventional values from the fairness literature (not derived from the data) and are cited by reference.

**Score resolution over ranking accuracy.** The Optuna-best credit model (4 trees, AUC 0.781) had 46% of users at the same score. The production model (200 trees, AUC 0.755) has 930 distinct prediction values and a 130-point defaulter/non-defaulter spread. For a product that needs to communicate meaningful score differences to users and lenders, resolution is more valuable than the last 0.026 AUC.

**Synthetic data with latent risk.** The synthetic generator makes ~35% of default risk unobservable by design. This caps Bayes-optimal AUC around 0.80–0.83, which is realistic for production credit models on thin-file populations without bureau data. It also prevents the model from reaching AUC 0.99 on synthetic data, which would be meaningless.

---

## Naming

- **Trace** — the platform: Squad-integrated virtual accounts, transaction ingestion, lender dashboard, and the ML layer on top
- **KudiScore** — the credit scoring product: 300–850 score, calibrated PD, SHAP explanations

A trader has a Trace account. That account produces a KudiScore.
