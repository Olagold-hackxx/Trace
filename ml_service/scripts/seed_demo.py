#!/usr/bin/env python3
"""
Demo database seed for Trace / KudiScore.

Usage:
    export SEED_DB_URL="postgres://user:pass@host:port/db?sslmode=require"
    python scripts/seed_demo.py --demo-day=2026-05-16
    python scripts/seed_demo.py --demo-day=2026-05-16 --ml-url=http://localhost:8000

Options:
    --demo-day   ISO date of the demo (required)
    --db-url     PostgreSQL connection URL (overrides $SEED_DB_URL env var)
    --ml-url     ML service URL for live score assertion (optional)

Drops and rebuilds all demo data in ~30 seconds.
Run from the ml_service/ directory.
"""

import argparse
import json
import math
import os
import random
import sys
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

try:
    import psycopg2
    from psycopg2.extras import execute_values, Json
except ImportError:
    sys.exit("psycopg2 not installed — run: pip install psycopg2-binary")

try:
    import bcrypt as _bcrypt
except ImportError:
    sys.exit("bcrypt not installed — run: pip install bcrypt")

# ── Config ────────────────────────────────────────────────────────────────────

FIXTURES_DIR = Path(__file__).resolve().parent.parent / "fixtures"

# DB URL is read from the environment — never hardcode credentials here.
# Set SEED_DB_URL before running, or pass --db-url on the command line.
DEFAULT_DB_URL = os.environ.get("SEED_DB_URL", "")

NAMESPACE     = uuid.UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890")
DEMO_PASSWORD = "Demo1234!"

# Stable fixture IDs used by the ML matching engine
IYA_JOB_FIXTURE_ID = "job_demo_iya_delivery"
TUNDE_WORKER_ID    = "w_demo_tunde"
BAYO_WORKER_ID     = "w_demo_bayo"
CHINEDU_WORKER_ID  = "w_demo_chinedu"

# ── People ────────────────────────────────────────────────────────────────────

# (full_name, phone, archetype, market_name, target_score, gender, age_bracket,
#  business_name, history_days, txn_per_day_range, avg_daily_inflow_kobo)
TRADERS = [
    ("Moriamo Adeyemi", "+2348011000001", "market_food_vendor",  "Unilag",          785, "F", "35-44", "Iya Moria Foods",      60, (3, 5), 1_100_000),
    ("Chidi Okonkwo",   "+2348011000002", "pos_agent",           "Yaba",            810, "M", "25-34", "Chidi POS Services",   60, (8,14), 2_600_000),
    ("Bola Fashola",    "+2348011000003", "electronics_retailer","Computer Village", 620, "M", "35-44", "BF Electronics",       35, (1, 3), 3_800_000),
    ("Kemi Balogun",    "+2348011000004", "tailor_artisan",      "Surulere",         580, "F", "25-34", "Kemi Fashion House",   30, (2, 4),   630_000),
    ("Sade Oduya",      "+2348011000005", "beauty_supplier",     "Lekki",            390, "F", "18-24", "Sade Beauty Supplies", 20, (1, 2),   240_000),
    ("Adebayo Lawal",   "+2348011000006", "okada_rider",         "Yaba",             720, "M", "25-34", None,                   45, (5, 8),   740_000),
    ("Funke Adeleke",   "+2348011000007", "market_food_vendor",  "Mushin",           680, "F", "35-44", "Funke Market Stall",   45, (3, 5),   710_000),
    ("Yusuf Ibrahim",   "+2348011000008", "pos_agent",           "Alaba",            750, "M", "45-54", "Yusuf POS Hub",        55, (6,12), 1_850_000),
    ("Zainab Musa",     "+2348011000009", "beauty_supplier",     "Idumota",          610, "F", "25-34", "Zainab Beauty World",  35, (2, 4),   790_000),
    ("Olamide Coker",   "+2348011000010", "tailor_artisan",      "Balogun",          660, "M", "18-24", "Olamide Creations",    40, (2, 3),   610_000),
]

LENDERS = [
    # (full_name, phone, email, display_name)
    ("GTCO Microfinance",  "+2348022000001", "gtco@demo.trace",   "GTCO Microfinance"),
    ("LAPO Microfinance",  "+2348022000002", "lapo@demo.trace",   "LAPO Microfinance"),
    ("Carbon Lending",     "+2348022000003", "carbon@demo.trace", "Carbon Lending"),
]

# Workers who need DB user accounts (Tunde applies live; Bayo+Chinedu are pre-seeded).
# Workers have 0 transactions → no TraceScore. The matching engine uses gig history
# from workers.json fixtures, NOT a credit score. Do not seed score_snapshots for workers.
WORKER_USERS = [
    ("Tunde Balogun", "+2348033000001", "multi_skill_worker", "Mushin", "M", "25-34"),
    ("Bayo Adeleke",  "+2348033000002", "delivery_worker",    "Mushin", "M", "18-24"),
    ("Chinedu Obi",   "+2348033000003", "okada_rider",        "Agege",  "M", "25-34"),
]

# ── Sender name pools ─────────────────────────────────────────────────────────

IYA_SENDERS = [
    "Biodun Adewale", "Kehinde Lawal", "Abeke Ayoola", "Femi Oduola",
    "Sola Akinwale", "Bunmi Olatunde", "Titi Adebanjo", "Rotimi Bakare",
]

GENERIC_SENDERS = [
    "Emeka Eze", "Ngozi Chukwu", "Yemi Okafor", "Tolu Adeyemi",
    "Ibrahim Musa", "Aisha Bello", "Hakeem Suleiman", "Grace Obi",
    "Chinonso Nwosu", "Fatima Abdullahi", "David Olu", "Mary Okeke",
    "Ahmed Hassan", "Blessing Ene", "Kelechi Uche", "Sandra Ogbu",
    "Ola Dada", "Rashid Usman", "Chioma Nzeh", "Bose Afolabi",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def uid(seed: str) -> str:
    return str(uuid.uuid5(NAMESPACE, seed))

def gen_bvn(seed_str: str) -> str:
    """Generate a deterministic 11-digit BVN matching the Nigerian format.
    Real BVNs start with '22' (NIBSS prefix). Remaining 9 digits are seeded
    so each demo user gets a unique, reproducible value."""
    rng = random.Random(seed_str)
    return "22" + "".join(str(rng.randint(0, 9)) for _ in range(9))

def nowutc() -> datetime:
    return datetime.now(timezone.utc)

def to_kobo(naira: float) -> int:
    return int(naira * 100)

def sub_scores_for(target: int) -> dict:
    rng = random.Random(target)
    base = max(0, (target - 300) / 550)
    def jitter(b, spread=8):
        return max(0, min(100, int(b * 100 + rng.randint(-spread, spread))))
    return {
        "cash_flow_stability": jitter(base * 0.95 + 0.05),
        "customer_base":       jitter(base * 0.90 + 0.05),
        "growth":              jitter(base * 0.85 + 0.05),
        "reliability":         jitter(base * 0.95 + 0.05),
    }

def factors_for(target: int) -> list:
    if target >= 750:
        return [
            {"direction": "positive", "text": "Consistent daily revenue over 60 days."},
            {"direction": "positive", "text": "Growing customer base with repeat buyers."},
            {"direction": "negative",  "text": "Single large sender dominates some weeks."},
        ]
    if target >= 650:
        return [
            {"direction": "positive", "text": "Regular payment activity observed."},
            {"direction": "negative",  "text": "Revenue dips on weekends reduce stability score."},
        ]
    if target >= 500:
        return [
            {"direction": "negative",  "text": "Irregular inflow pattern detected."},
            {"direction": "negative",  "text": "Limited transaction history (< 35 days)."},
        ]
    return [
        {"direction": "negative", "text": "Very short transaction history."},
        {"direction": "negative", "text": "Revenue is declining month-over-month."},
        {"direction": "negative", "text": "Missed repayment detected on active loan."},
    ]

def pd_for(score: int) -> float:
    return round(max(0.01, min(0.99, (850 - score) / 550 * 0.8)), 6)

# ── DDL ───────────────────────────────────────────────────────────────────────

DDL = """
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           TEXT        UNIQUE NOT NULL,
    password_hash   TEXT,
    full_name       TEXT        NOT NULL,
    business_name   TEXT,
    business_type   TEXT,
    market_name     TEXT,
    language        TEXT        NOT NULL DEFAULT 'english',
    role            TEXT        NOT NULL DEFAULT 'trader',
    archetype       TEXT,
    gender          TEXT,
    age_bracket     TEXT,
    bvn_last4       TEXT,
    bvn             TEXT,
    email           TEXT,
    lender_visible  BOOLEAN     NOT NULL DEFAULT false,
    password_hash   TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Add password_hash to existing tables that predate this column
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE TABLE IF NOT EXISTS transactions (
    id                           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                      UUID    NOT NULL,
    reference                    TEXT    UNIQUE NOT NULL,
    type                         TEXT    NOT NULL,
    amount_kobo                  BIGINT  NOT NULL,
    sender_name                  TEXT,
    sender_account               TEXT,
    masked_sender_account_number TEXT,
    session_id                   TEXT,
    remarks                      TEXT,
    channel                      TEXT    DEFAULT 'mobile',
    transaction_indicator        TEXT,
    virtual_account_number       TEXT,
    settled_amount_kobo          BIGINT,
    principal_amount_kobo        BIGINT,
    status                       TEXT    NOT NULL DEFAULT 'success',
    raw_payload                  JSONB   NOT NULL DEFAULT '{}',
    occurred_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_txn_user_date ON transactions (user_id, occurred_at);

CREATE TABLE IF NOT EXISTS score_snapshots (
    id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID    NOT NULL,
    score         INTEGER NOT NULL,
    pd            NUMERIC(10,6),
    sub_scores    JSONB   NOT NULL DEFAULT '{}',
    factors       JSONB   NOT NULL DEFAULT '[]',
    model_version TEXT    NOT NULL DEFAULT 'seeded-v1',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_snap_user ON score_snapshots (user_id, created_at);

CREATE TABLE IF NOT EXISTS loans (
    id                  UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID   NOT NULL,
    offer_id            UUID,
    lender_name         TEXT   NOT NULL,
    principal_kobo      BIGINT NOT NULL,
    amount_repaid_kobo  BIGINT NOT NULL DEFAULT 0,
    rate_label          TEXT   NOT NULL,
    tenor_label         TEXT   NOT NULL,
    repayment_method    TEXT   NOT NULL DEFAULT 'cash_flow_indexed',
    repayment_pct_label TEXT   NOT NULL DEFAULT '5%',
    status              TEXT   NOT NULL DEFAULT 'active',
    next_due_date       TEXT,
    squad_payout_ref    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loan_applications (
    id             UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID   NOT NULL,
    amount_kobo    BIGINT NOT NULL,
    purpose        TEXT   NOT NULL,
    tenor          TEXT   NOT NULL,
    revenue_source TEXT   NOT NULL,
    proposal       TEXT   NOT NULL,
    status         TEXT   NOT NULL DEFAULT 'under_review',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loan_offers (
    id                      UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID   NOT NULL,
    lender_name             TEXT   NOT NULL,
    amount_kobo             BIGINT NOT NULL,
    rate_label              TEXT   NOT NULL,
    tenor_label             TEXT   NOT NULL,
    monthly_repayment_label TEXT   NOT NULL,
    status                  TEXT   NOT NULL DEFAULT 'available',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
    id                UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    posted_by_user_id UUID   NOT NULL,
    title             TEXT   NOT NULL,
    category          TEXT   NOT NULL,
    pay_kobo          BIGINT NOT NULL,
    duration_label    TEXT   NOT NULL,
    location          TEXT   NOT NULL,
    description       TEXT   NOT NULL,
    status            TEXT   NOT NULL DEFAULT 'active',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id     UUID NOT NULL,
    user_id    UUID NOT NULL,
    cover_note TEXT,
    status     TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lender_wallets (
    id                    UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID   UNIQUE NOT NULL,
    available_kobo        BIGINT NOT NULL DEFAULT 0,
    deployed_kobo         BIGINT NOT NULL DEFAULT 0,
    total_deposited_kobo  BIGINT NOT NULL DEFAULT 0,
    total_returns_kobo    BIGINT NOT NULL DEFAULT 0,
    virtual_account_number TEXT,
    bank_name             TEXT,
    squad_customer_id     TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS virtual_accounts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID UNIQUE NOT NULL,
    squad_customer_id TEXT,
    account_number    TEXT UNIQUE,
    bank_name         TEXT NOT NULL DEFAULT 'GTBank',
    status            TEXT NOT NULL DEFAULT 'active',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
    token      TEXT        PRIMARY KEY,
    user_id    UUID        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_links (
    id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID    NOT NULL,
    name        TEXT    NOT NULL,
    slug        TEXT    UNIQUE NOT NULL,
    amount_kobo BIGINT,
    description TEXT,
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forecasts (
    user_id           TEXT    NOT NULL,
    forecast_date     DATE    NOT NULL,
    fit_at            TIMESTAMPTZ NOT NULL,
    predicted_inflow  BIGINT  NOT NULL,
    lower_bound_80    BIGINT  NOT NULL,
    upper_bound_80    BIGINT  NOT NULL,
    model_version     TEXT    NOT NULL,
    PRIMARY KEY (user_id, forecast_date)
);

CREATE TABLE IF NOT EXISTS dip_warnings (
    id                  BIGSERIAL   PRIMARY KEY,
    user_id             TEXT        NOT NULL,
    detected_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dip_start_date      DATE        NOT NULL,
    dip_end_date        DATE        NOT NULL,
    expected_gap_kobo   BIGINT      NOT NULL,
    suggested_loan_kobo BIGINT      NOT NULL,
    severity            TEXT        NOT NULL,
    offer_state         TEXT        NOT NULL DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID,
    user_id        UUID    NOT NULL,
    anomaly_score  FLOAT   NOT NULL,
    is_anomalous   BOOLEAN NOT NULL DEFAULT true,
    top_signals    TEXT[]  NOT NULL DEFAULT '{}',
    fraud_penalty  FLOAT   NOT NULL DEFAULT 0,
    severity       TEXT    NOT NULL DEFAULT 'low',
    status         TEXT    NOT NULL DEFAULT 'open',
    reviewed_at    TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent column additions for tables created before this field existed
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
"""

TRUNCATE_SQL = """
TRUNCATE TABLE
    fraud_alerts, dip_warnings, forecasts,
    job_applications, jobs,
    loan_offers, loan_applications, loans,
    score_snapshots, transactions,
    lender_wallets, virtual_accounts, sessions, payment_links,
    users
CASCADE;
"""

# ── Seeding functions ─────────────────────────────────────────────────────────

def demo_email(full_name: str) -> str:
    parts = full_name.lower().split()
    return f"{parts[0]}.{parts[-1]}@trace.com"


def seed_users(cur, demo_day: date) -> dict:
    """Insert all users. Returns phone → id mapping."""
    print("  Hashing demo passwords (bcrypt cost=12, ~2 s each)…")
    password_hash = _bcrypt.hashpw(DEMO_PASSWORD.encode(), _bcrypt.gensalt(12)).decode()

    rows = []
    for (name, phone, archetype, market, score, gender, age, biz, *_) in TRADERS:
        bvn = gen_bvn(f"bvn-{phone}")
        rows.append((
            uid(phone), phone, password_hash, name, biz, None, market,
            "english", "trader", archetype, gender, age,
            bvn[-4:], bvn, demo_email(name), False,
            datetime(demo_day.year - 1, demo_day.month, demo_day.day, tzinfo=timezone.utc),
        ))
    for (name, phone, _, display) in LENDERS:
        bvn = gen_bvn(f"bvn-{phone}")
        rows.append((
            uid(phone), phone, password_hash, display, None, None, None,
            "english", "lender", None, None, None,
            bvn[-4:], bvn, f"{phone}@demo.trace", True,
            datetime(demo_day.year - 1, demo_day.month, demo_day.day, tzinfo=timezone.utc),
        ))
    for (name, phone, archetype, market, gender, age) in WORKER_USERS:
        bvn = gen_bvn(f"bvn-{phone}")
        rows.append((
            uid(phone), phone, password_hash, name, None, None, market,
            "english", "trader", archetype, gender, age,
            bvn[-4:], bvn, demo_email(name), False,
            datetime(demo_day.year - 1, demo_day.month, demo_day.day, tzinfo=timezone.utc),
        ))

    execute_values(cur, """
        INSERT INTO users
            (id, phone, password_hash, full_name, business_name, business_type, market_name,
             language, role, archetype, gender, age_bracket,
             bvn_last4, bvn, email, lender_visible, created_at)
        VALUES %s
        ON CONFLICT (phone) DO UPDATE SET
            full_name     = EXCLUDED.full_name,
            password_hash = EXCLUDED.password_hash,
            archetype     = EXCLUDED.archetype,
            market_name   = EXCLUDED.market_name,
            email         = EXCLUDED.email,
            bvn           = EXCLUDED.bvn,
            bvn_last4     = EXCLUDED.bvn_last4
    """, rows)

    return {phone: uid(phone) for (_, phone, *_) in TRADERS + LENDERS + WORKER_USERS}


def seed_transactions(cur, user_ids: dict, demo_day: date) -> dict:
    """Generate transaction history. Returns user_id → list[txn_id]."""
    rng = random.Random(42)
    cutoff = datetime.combine(demo_day, datetime.min.time(), tzinfo=timezone.utc) - timedelta(hours=6)
    txn_map = {uid: [] for uid in user_ids.values()}

    rows = []
    for (name, phone, archetype, market, target_score, gender, age, biz,
         history_days, txn_range, avg_daily_inflow) in TRADERS:

        user_id = user_ids[phone]
        senders = IYA_SENDERS if "Moriamo" in name else GENERIC_SENDERS
        num_senders = 8 if target_score >= 750 else 5 if target_score >= 600 else 3

        # Sade's transactions decrease over time; others grow
        growth = -0.15 if target_score < 400 else 0.20

        for day_offset in range(history_days, 0, -1):
            day_dt = cutoff - timedelta(days=day_offset)

            # Skip occasional days for lower-score users
            skip_prob = 0.02 if target_score >= 750 else 0.10 if target_score >= 600 else 0.35
            if rng.random() < skip_prob:
                continue

            daily_factor = 1 + growth * (1 - day_offset / history_days)
            n_txns = rng.randint(*txn_range)

            for t in range(n_txns):
                amount = int(avg_daily_inflow * daily_factor / n_txns * rng.uniform(0.7, 1.4))
                occurred = day_dt.replace(
                    hour=rng.randint(7, 20), minute=rng.randint(0, 59), second=rng.randint(0, 59)
                )
                # Sade: occasional suspicious large single sender
                sender = senders[rng.randint(0, num_senders - 1)]
                txn_id = uid(f"txn-{phone}-{day_offset}-{t}")
                txn_map[user_id].append(txn_id)
                rows.append((
                    txn_id, user_id,
                    f"SEED-{phone[-4:]}-{day_offset:03d}-{t}",
                    "credit",
                    amount,
                    sender,
                    f"00{rng.randint(1000000, 9999999)}",
                    "success",
                    Json({}),
                    occurred,
                ))

            # Occasional outflow (market purchases, transport)
            if rng.random() < 0.3:
                out_amt = int(avg_daily_inflow * 0.15 * rng.uniform(0.5, 1.5))
                occurred = day_dt.replace(
                    hour=rng.randint(8, 18), minute=rng.randint(0, 59)
                )
                txn_id = uid(f"txn-{phone}-{day_offset}-out")
                txn_map[user_id].append(txn_id)
                rows.append((
                    txn_id, user_id,
                    f"SEED-{phone[-4:]}-{day_offset:03d}-O",
                    "debit",
                    out_amt,
                    "Transfer",
                    None,
                    "success",
                    Json({}),
                    occurred,
                ))

    execute_values(cur, """
        INSERT INTO transactions
            (id, user_id, reference, type, amount_kobo, sender_name,
             masked_sender_account_number, status, raw_payload, occurred_at)
        VALUES %s
        ON CONFLICT (reference) DO NOTHING
    """, rows)

    print(f"  {len(rows):,} transactions inserted")
    return txn_map


def seed_score_snapshots(cur, user_ids: dict, demo_day: date):
    """Daily score snapshots per trader — last 30–60 days converging to target."""
    rng = random.Random(99)
    rows = []

    for trader in TRADERS:
        name, phone, target_score, history_days = trader[0], trader[1], trader[4], trader[8]
        user_id = user_ids[phone]
        start_score = max(300, target_score - rng.randint(40, 80))

        for day_offset in range(history_days, 0, -1):
            progress = 1 - day_offset / history_days
            score = int(start_score + (target_score - start_score) * progress
                        + rng.randint(-5, 5))
            score = max(300, min(850, score))
            snap_date = datetime.combine(
                demo_day - timedelta(days=day_offset),
                datetime.min.time(), tzinfo=timezone.utc
            ) + timedelta(hours=2)
            rows.append((
                uid(f"snap-{phone}-{day_offset}"),
                user_id, score,
                pd_for(score),
                Json(sub_scores_for(score)),
                Json(factors_for(score)),
                "seeded-v1",
                snap_date,
            ))

    execute_values(cur, """
        INSERT INTO score_snapshots
            (id, user_id, score, pd, sub_scores, factors, model_version, created_at)
        VALUES %s
        ON CONFLICT DO NOTHING
    """, rows)
    print(f"  {len(rows):,} score snapshots inserted")


def seed_loans(cur, user_ids: dict, demo_day: date) -> dict:
    """6 loans in various states. Returns user_phone → loan_id."""
    loan_ids = {}
    chidi   = user_ids["+2348011000002"]
    bola    = user_ids["+2348011000003"]
    kemi    = user_ids["+2348011000004"]
    sade    = user_ids["+2348011000005"]
    yusuf   = user_ids["+2348011000008"]
    zainab  = user_ids["+2348011000009"]

    # 1. Chidi — active, 50% repaid
    lid = uid("loan-chidi-001")
    loan_ids["chidi"] = lid
    principal = 20_000_000  # ₦200k
    cur.execute("""
        INSERT INTO loans (id, user_id, lender_name, principal_kobo, amount_repaid_kobo,
            rate_label, tenor_label, repayment_method, repayment_pct_label, status,
            next_due_date, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        ON CONFLICT DO NOTHING
    """, (lid, chidi, "GTCO Microfinance", principal, principal // 2,
          "5% / month", "90 days", "cash_flow_indexed", "5%", "active",
          (demo_day + timedelta(days=15)).isoformat(),
          datetime.combine(demo_day - timedelta(days=45), datetime.min.time(), tzinfo=timezone.utc)))

    # 2. Bola — repaid in full
    lid = uid("loan-bola-001")
    loan_ids["bola"] = lid
    principal = 10_000_000  # ₦100k
    cur.execute("""
        INSERT INTO loans (id, user_id, lender_name, principal_kobo, amount_repaid_kobo,
            rate_label, tenor_label, repayment_method, repayment_pct_label, status, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
    """, (lid, bola, "GTCO Microfinance", principal, principal,
          "4% / month", "60 days", "cash_flow_indexed", "4%", "repaid",
          datetime.combine(demo_day - timedelta(days=90), datetime.min.time(), tzinfo=timezone.utc)))

    # 3. Kemi — pending offer (loan offer exists, not accepted)
    offer_id = uid("offer-kemi-001")
    loan_ids["kemi_offer"] = offer_id
    cur.execute("""
        INSERT INTO loan_offers (id, user_id, lender_name, amount_kobo,
            rate_label, tenor_label, monthly_repayment_label, status, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
    """, (offer_id, kemi, "LAPO Microfinance", 15_000_000,
          "3.5% / month", "60 days", "₦262,500 / month", "available",
          datetime.combine(demo_day - timedelta(days=2), datetime.min.time(), tzinfo=timezone.utc)))
    # Application that led to the offer
    cur.execute("""
        INSERT INTO loan_applications (id, user_id, amount_kobo, purpose, tenor,
            revenue_source, proposal, status, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
    """, (uid("app-kemi-001"), kemi, 15_000_000,
          "Buy sewing machine and fabrics", "60 days",
          "Tailoring income from Surulere market",
          "I need the funds to purchase a commercial-grade sewing machine and fabric stock "
          "for the upcoming festive season. My regular customers have increased orders.",
          "approved",
          datetime.combine(demo_day - timedelta(days=5), datetime.min.time(), tzinfo=timezone.utc)))

    # 4. Sade — defaulted (paid 30% then stopped)
    lid = uid("loan-sade-001")
    loan_ids["sade"] = lid
    principal = 8_000_000  # ₦80k
    cur.execute("""
        INSERT INTO loans (id, user_id, lender_name, principal_kobo, amount_repaid_kobo,
            rate_label, tenor_label, repayment_method, repayment_pct_label, status, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
    """, (lid, sade, "Carbon Lending", principal, int(principal * 0.30),
          "6% / month", "60 days", "cash_flow_indexed", "6%", "defaulted",
          datetime.combine(demo_day - timedelta(days=55), datetime.min.time(), tzinfo=timezone.utc)))

    # 5. Yusuf — repaid in full
    lid = uid("loan-yusuf-001")
    loan_ids["yusuf"] = lid
    principal = 15_000_000  # ₦150k
    cur.execute("""
        INSERT INTO loans (id, user_id, lender_name, principal_kobo, amount_repaid_kobo,
            rate_label, tenor_label, repayment_method, repayment_pct_label, status, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
    """, (lid, yusuf, "Carbon Lending", principal, principal,
          "4.5% / month", "90 days", "cash_flow_indexed", "4.5%", "repaid",
          datetime.combine(demo_day - timedelta(days=100), datetime.min.time(), tzinfo=timezone.utc)))

    # 6. Zainab — active, 25% repaid
    lid = uid("loan-zainab-001")
    loan_ids["zainab"] = lid
    principal = 18_000_000  # ₦180k
    cur.execute("""
        INSERT INTO loans (id, user_id, lender_name, principal_kobo, amount_repaid_kobo,
            rate_label, tenor_label, repayment_method, repayment_pct_label, status,
            next_due_date, created_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
    """, (lid, zainab, "GTCO Microfinance", principal, int(principal * 0.25),
          "5% / month", "90 days", "cash_flow_indexed", "5%", "active",
          (demo_day + timedelta(days=22)).isoformat(),
          datetime.combine(demo_day - timedelta(days=25), datetime.min.time(), tzinfo=timezone.utc)))

    print(f"  6 loans + 1 offer seeded")
    return loan_ids


def seed_jobs(cur, user_ids: dict, demo_day: date) -> dict:
    """5 jobs including Iya's demo-critical posting. Returns label → job_id."""
    iya    = user_ids["+2348011000001"]
    bola   = user_ids["+2348011000003"]
    adebayo = user_ids["+2348011000006"]

    job_ids = {}
    jobs = [
        # Iya's delivery job — demo-critical (posted 2 days ago, 2 applicants already)
        ("iya_delivery",
         iya, "Delivery boy needed — Unilag campus lunch runs",
         "delivery", 500_000, "Ongoing (Mon–Sat)", "Unilag, Yaba, Lagos",
         "I need a reliable delivery person for my food stall on Unilag campus. "
         "Lunch hour deliveries, 11am–2pm daily. Must know campus layout. "
         "₦5,000 per day. Start immediately.",
         "active", demo_day - timedelta(days=2)),

        # Welding job — posted by Bola
        ("welding_gate",
         bola, "Experienced welder — security gate for shop",
         "welding", 1_500_000, "3–4 days", "Computer Village, Ikeja",
         "Need a skilled welder to fabricate and install a security gate for our electronics "
         "shop. Mild steel, own welding machine preferred. ₦15,000 for the job.",
         "active", demo_day - timedelta(days=5)),

        # Electrician job
        ("electrician_reno",
         adebayo, "Electrician for full rewiring — 3-bedroom flat",
         "electrical", 2_000_000, "2 days", "Yaba, Lagos",
         "Need a certified electrician to rewire a 3-bedroom flat. Supply new sockets, "
         "change fuse board. Materials provided. ₦20,000 labour only.",
         "active", demo_day - timedelta(days=3)),

        # Painter job
        ("painter_signage",
         iya, "Sign painter — board signage for stall",
         "painting", 250_000, "1 day", "Unilag Main Gate, Lagos",
         "Need a sign painter to repaint my food stall signage. Hand lettering preferred. "
         "₦2,500 for the day. Materials provided.",
         "active", demo_day - timedelta(days=7)),

        # Plumber job
        ("plumber_repairs",
         bola, "Plumber — fix burst pipe and install sink",
         "plumbing", 600_000, "Half day", "Ikeja, Lagos",
         "Burst pipe in the store room and need a new sink installed in the back office. "
         "₦6,000 for both jobs. Own tools required.",
         "active", demo_day - timedelta(days=4)),
    ]

    for (label, posted_by, title, category, pay_kobo, duration, location, desc, status, created_date) in jobs:
        jid = uid(f"job-{label}")
        job_ids[label] = jid
        cur.execute("""
            INSERT INTO jobs (id, posted_by_user_id, title, category, pay_kobo,
                duration_label, location, description, status, created_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
        """, (jid, posted_by, title, category, pay_kobo, duration,
              location, desc, status,
              datetime.combine(created_date, datetime.min.time(), tzinfo=timezone.utc)))

    print(f"  {len(jobs)} jobs seeded")
    return job_ids


def seed_job_applications(cur, user_ids: dict, job_ids: dict, demo_day: date):
    """Pre-seed Bayo and Chinedu applied to Iya's delivery job."""
    iya_job = job_ids["iya_delivery"]
    bayo    = user_ids["+2348033000002"]
    chinedu = user_ids["+2348033000003"]

    apps = [
        (uid("japp-bayo-iya"),    iya_job, bayo,
         "I am a reliable delivery person available for immediate start.",
         demo_day - timedelta(days=1)),
        (uid("japp-chinedu-iya"), iya_job, chinedu,
         "I have my own okada and know the Unilag area well. Available now.",
         demo_day - timedelta(days=1)),
    ]
    for (aid, jid, uid_, note, applied_date) in apps:
        cur.execute("""
            INSERT INTO job_applications (id, job_id, user_id, cover_note, status, created_at)
            VALUES (%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING
        """, (aid, jid, uid_, note, "pending",
              datetime.combine(applied_date, datetime.min.time(), tzinfo=timezone.utc) + timedelta(hours=9)))
    print(f"  2 pre-seeded applicants (Bayo + Chinedu) for Iya's delivery job")


def seed_lender_wallets(cur, user_ids: dict):
    """Lender wallets with realistic capital and deployment."""
    wallets = [
        # (phone, available_kobo, deployed_kobo, total_deposited, total_returns)
        ("+2348022000001", 300_000_000, 38_000_000, 500_000_000, 25_000_000),  # GTCO
        ("+2348022000002", 200_000_000,          0, 200_000_000,  8_000_000),  # LAPO
        ("+2348022000003", 313_200_000, 36_800_000, 350_000_000, 19_000_000),  # Carbon
    ]
    for (phone, avail, deployed, deposited, returns) in wallets:
        cur.execute("""
            INSERT INTO lender_wallets
                (id, user_id, available_kobo, deployed_kobo,
                 total_deposited_kobo, total_returns_kobo)
            VALUES (%s,%s,%s,%s,%s,%s)
            ON CONFLICT (user_id) DO UPDATE SET
                available_kobo       = EXCLUDED.available_kobo,
                deployed_kobo        = EXCLUDED.deployed_kobo,
                total_deposited_kobo = EXCLUDED.total_deposited_kobo,
                total_returns_kobo   = EXCLUDED.total_returns_kobo
        """, (uid(f"wallet-{phone}"), user_ids[phone], avail, deployed, deposited, returns))
    print("  3 lender wallets seeded")


def seed_fraud_alerts(cur, user_ids: dict, txn_map: dict, demo_day: date):
    """Pre-seed 6 past fraud alerts to populate the admin panel."""
    rng = random.Random(77)
    sade   = user_ids["+2348011000005"]
    zainab = user_ids["+2348011000009"]
    kemi   = user_ids["+2348011000004"]

    alerts = [
        (sade,   0.91, "high",   "open",     None,
         ["single_sender_dominance", "amount_spike", "short_history"],
         demo_day - timedelta(days=8)),
        (sade,   0.78, "high",   "reviewed", demo_day - timedelta(days=6),
         ["amount_spike", "unusual_hour"],
         demo_day - timedelta(days=10)),
        (zainab, 0.61, "medium", "open",     None,
         ["sender_velocity", "amount_spike"],
         demo_day - timedelta(days=3)),
        (kemi,   0.44, "low",    "reviewed", demo_day - timedelta(days=12),
         ["unusual_hour"],
         demo_day - timedelta(days=14)),
        (zainab, 0.55, "medium", "open",     None,
         ["sender_velocity", "single_sender_dominance"],
         demo_day - timedelta(days=1)),
        (sade,   0.88, "high",   "open",     None,
         ["amount_spike", "single_sender_dominance", "short_history"],
         demo_day - timedelta(days=5)),
    ]

    rows = []
    for (uid_, score, severity, status, reviewed_at, signals, created_date) in alerts:
        txns = txn_map.get(uid_, [])
        txn_id = txns[rng.randint(0, len(txns) - 1)] if txns else None
        rows.append((
            uid(f"fraud-{uid_}-{created_date}"),
            txn_id, uid_, score, True, signals,
            round(score * 100, 1), severity, status,
            datetime.combine(reviewed_at, datetime.min.time(), tzinfo=timezone.utc) if reviewed_at else None,
            datetime.combine(created_date, datetime.min.time(), tzinfo=timezone.utc) + timedelta(hours=14),
        ))

    execute_values(cur, """
        INSERT INTO fraud_alerts
            (id, transaction_id, user_id, anomaly_score, is_anomalous,
             top_signals, fraud_penalty, severity, status, reviewed_at, created_at)
        VALUES %s ON CONFLICT DO NOTHING
    """, rows)
    print(f"  {len(rows)} fraud alerts seeded")


def seed_forecasts(cur, user_ids: dict, txn_map: dict, demo_day: date):
    """Pre-compute 30-day forecasts using a simple seasonal model."""
    horizon = 30
    fit_at  = datetime.combine(demo_day, datetime.min.time(), tzinfo=timezone.utc) - timedelta(hours=1)

    # Weekly seasonality multipliers Mon=0 … Sun=6
    WEEK_PATTERN = [1.05, 1.10, 1.15, 1.20, 1.30, 1.25, 0.75]

    rows = []
    for (name, phone, *_, avg_daily_inflow) in TRADERS:
        user_id = user_ids[phone]
        base    = avg_daily_inflow * 0.85  # slight downward adjustment

        for d in range(horizon):
            fdate = demo_day + timedelta(days=d + 1)
            weekday = fdate.weekday()
            trend   = 1 + 0.005 * d
            pred    = int(base * WEEK_PATTERN[weekday] * trend)
            lower   = int(pred * 0.80)
            upper   = int(pred * 1.22)
            rows.append((str(user_id), fdate, fit_at, pred, lower, upper, "seed-prophet-v1"))

    execute_values(cur, """
        INSERT INTO forecasts
            (user_id, forecast_date, fit_at,
             predicted_inflow, lower_bound_80, upper_bound_80, model_version)
        VALUES %s
        ON CONFLICT (user_id, forecast_date) DO UPDATE SET
            fit_at           = EXCLUDED.fit_at,
            predicted_inflow = EXCLUDED.predicted_inflow,
            lower_bound_80   = EXCLUDED.lower_bound_80,
            upper_bound_80   = EXCLUDED.upper_bound_80,
            model_version    = EXCLUDED.model_version
    """, rows)
    print(f"  {len(rows)} forecast rows seeded ({horizon} days × 10 traders)")


def update_fixtures(demo_day: date):
    """Patch workers.json and jobs.json with demo-critical characters."""

    # ── workers.json ──────────────────────────────────────────────────────────
    w_path = FIXTURES_DIR / "workers.json"
    workers = json.loads(w_path.read_text()) if w_path.exists() else []

    # Remove any existing demo workers
    workers = [w for w in workers if not w["worker_id"].startswith("w_demo_")]

    demo_workers = [
        {   # Tunde — must rank top 2 for delivery job
            "worker_id": TUNDE_WORKER_ID,
            "name": "Tunde Balogun",
            "primary_category": "delivery",
            "secondary_categories": ["welding", "errands"],
            "bio": "Multi-skilled Lagos hustler. 12 completed gigs, 5-star rated. "
                   "Delivery, errands, and light welding. Available immediately.",
            "skills": ["delivery", "errands", "welding", "campus delivery"],
            "location_name": "Mushin",
            "location_lat": 6.5244,
            "location_lng": 3.3600,
            "service_radius_km": 15,
            "daily_rate_naira": 5000,
            "completed_gigs": 12,
            "avg_rating": 5.0,
            "completion_rate": 1.0,
            "kudiscore_tier": "good",
            "bvn_verified": True,
            "days_since_last_active": 0,
            "last_active_at": demo_day.isoformat() + "T08:00:00",
        },
        {   # Bayo — delivery-only, no history, no score
            "worker_id": BAYO_WORKER_ID,
            "name": "Bayo Adeleke",
            "primary_category": "delivery",
            "secondary_categories": [],
            "bio": "Available for delivery work in Lagos.",
            "skills": ["delivery"],
            "location_name": "Mushin",
            "location_lat": 6.5250,
            "location_lng": 3.3650,
            "service_radius_km": 10,
            "daily_rate_naira": 5000,
            "completed_gigs": 0,
            "avg_rating": None,
            "completion_rate": None,
            "kudiscore_tier": None,
            "bvn_verified": False,
            "days_since_last_active": 2,
            "last_active_at": (demo_day - timedelta(days=2)).isoformat() + "T10:00:00",
        },
        {   # Chinedu — okada/delivery, some history, slightly farther
            "worker_id": CHINEDU_WORKER_ID,
            "name": "Chinedu Obi",
            "primary_category": "delivery",
            "secondary_categories": ["errands"],
            "bio": "Okada rider with delivery experience. Based in Agege.",
            "skills": ["delivery", "okada", "errands"],
            "location_name": "Agege",
            "location_lat": 6.6194,
            "location_lng": 3.3236,
            "service_radius_km": 20,
            "daily_rate_naira": 4500,
            "completed_gigs": 3,
            "avg_rating": 3.8,
            "completion_rate": 0.75,
            "kudiscore_tier": None,
            "bvn_verified": True,
            "days_since_last_active": 1,
            "last_active_at": (demo_day - timedelta(days=1)).isoformat() + "T09:00:00",
        },
    ]
    # Prepend demo workers so they're easy to find in the pool
    workers = demo_workers + workers
    w_path.write_text(json.dumps(workers, indent=2, default=str))
    print(f"  workers.json updated ({len(workers)} workers, 3 demo characters prepended)")

    # ── jobs.json ─────────────────────────────────────────────────────────────
    j_path = FIXTURES_DIR / "jobs.json"
    jobs_fixture = json.loads(j_path.read_text()) if j_path.exists() else []

    # Remove existing demo job
    jobs_fixture = [j for j in jobs_fixture if j["job_id"] != IYA_JOB_FIXTURE_ID]

    iya_job_fixture = {
        "job_id": IYA_JOB_FIXTURE_ID,
        "title": "Delivery boy needed — Unilag campus lunch runs",
        "description": "Reliable delivery person for food stall on Unilag campus. "
                       "Lunch hour deliveries 11am–2pm daily, Mon–Sat. "
                       "Must know campus layout. ₦5,000/day. Start immediately.",
        "category": "delivery",
        "location_name": "Unilag, Yaba, Lagos",
        "budget_naira": 5000,
        "duration_estimate": "Ongoing",
        "posted_language": "en",
        "employer_verified": True,
        "location_lat": 6.5158,
        "location_lng": 3.3940,
        "employer_id": uid("+2348011000001"),
        "posted_at": int((datetime.combine(demo_day - timedelta(days=2),
                                           datetime.min.time(),
                                           tzinfo=timezone.utc)).timestamp() * 1000),
    }
    jobs_fixture = [iya_job_fixture] + jobs_fixture
    j_path.write_text(json.dumps(jobs_fixture, indent=2, default=str))
    print(f"  jobs.json updated ({len(jobs_fixture)} jobs, Iya's delivery job prepended)")


# ── Assertions ────────────────────────────────────────────────────────────────

def run_assertions(cur, user_ids: dict, loan_ids: dict, job_ids: dict, ml_url=None):
    failures = []

    def check(label, ok, detail=""):
        mark = "✓" if ok else "✗"
        print(f"  {mark} {label}" + (f" — {detail}" if detail else ""))
        if not ok:
            failures.append(label)

    iya_id    = user_ids["+2348011000001"]
    sade_id   = user_ids["+2348011000005"]
    gtco_id   = user_ids["+2348022000001"]
    lapo_id   = user_ids["+2348022000002"]
    carbon_id = user_ids["+2348022000003"]

    # 1. Iya has a seeded snapshot near 785
    cur.execute("SELECT score FROM score_snapshots WHERE user_id=%s ORDER BY created_at DESC LIMIT 1", (iya_id,))
    row = cur.fetchone()
    iya_score = row[0] if row else 0
    check("Iya Moria latest snapshot in 785 ± 10", abs(iya_score - 785) <= 10, f"score={iya_score}")

    # 2. Iya has no active loan
    cur.execute("SELECT COUNT(*) FROM loans WHERE user_id=%s AND status='active'", (iya_id,))
    n_active = cur.fetchone()[0]
    check("Iya Moria has no active loan", n_active == 0, f"active_loans={n_active}")

    # 3. Iya's most recent transaction is ≤ 8 hours before demo-day midnight
    cur.execute("SELECT MAX(occurred_at) FROM transactions WHERE user_id=%s", (iya_id,))
    last_txn = cur.fetchone()[0]
    if last_txn:
        now_utc = nowutc()
        hours_ago = (now_utc - last_txn.replace(tzinfo=timezone.utc)).total_seconds() / 3600
        check("Iya's last transaction ≤ 8 h before demo day", hours_ago <= 32, f"hours_ago={hours_ago:.1f}")
    else:
        check("Iya has transactions", False, "no transactions found")

    # 4. Iya's job has 2 pre-seeded applicants
    cur.execute("SELECT COUNT(*) FROM job_applications WHERE job_id=%s", (job_ids["iya_delivery"],))
    n_apps = cur.fetchone()[0]
    check("Iya's delivery job has 2 pre-seeded applicants", n_apps == 2, f"applicants={n_apps}")

    # 5. Sade's loan is defaulted
    cur.execute("SELECT status FROM loans WHERE user_id=%s ORDER BY created_at DESC LIMIT 1", (sade_id,))
    row = cur.fetchone()
    sade_status = row[0] if row else "not_found"
    check("Sade's loan shows as defaulted", sade_status == "defaulted", f"status={sade_status}")

    # 6. All 3 lender wallets sum to correct totals
    cur.execute("SELECT SUM(total_deposited_kobo) FROM lender_wallets WHERE user_id IN (%s,%s,%s)",
                (gtco_id, lapo_id, carbon_id))
    total = cur.fetchone()[0] or 0
    expected = 500_000_000 + 200_000_000 + 350_000_000
    check("Lender portfolios total ₦10.5M", total == expected, f"total={total/100:,.0f}")

    # 7. Tunde is in workers.json and positioned for delivery
    w_path = FIXTURES_DIR / "workers.json"
    if w_path.exists():
        workers = json.loads(w_path.read_text())
        tunde = next((w for w in workers if w["worker_id"] == TUNDE_WORKER_ID), None)
        check("Tunde in workers.json with delivery category",
              tunde is not None and tunde.get("primary_category") == "delivery",
              f"found={tunde is not None}")
    else:
        check("workers.json exists", False)

    # 8 (optional). Live ML score assertion
    if ml_url:
        try:
            import urllib.request, json as _json
            body = _json.dumps({"user_id": str(iya_id)}).encode()
            req  = urllib.request.Request(
                f"{ml_url}/predict/score", data=body,
                headers={"Content-Type": "application/json"}, method="POST"
            )
            with urllib.request.urlopen(req, timeout=30) as resp:
                ml_score = _json.loads(resp.read())["score"]
            check(f"Iya live ML score 785 ± 5 (got {ml_score})",
                  abs(ml_score - 785) <= 5, f"ml_score={ml_score}")
        except Exception as e:
            check("Iya live ML score (skipped)", True, f"ML not reachable: {e}")

    if failures:
        print(f"\n  ✗ {len(failures)} assertion(s) failed: {', '.join(failures)}")
        print("  Fix these before the demo.\n")
        sys.exit(1)


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Seed the Trace demo database")
    parser.add_argument("--demo-day", required=True, help="ISO date, e.g. 2026-05-16")
    parser.add_argument("--db-url",   default=DEFAULT_DB_URL or None,
                        help="PostgreSQL URL (or set $SEED_DB_URL)")
    parser.add_argument("--ml-url",   default=None, help="ML service base URL for live assertion")
    args = parser.parse_args()

    if not args.db_url:
        sys.exit(
            "No database URL provided.\n"
            "  Set the SEED_DB_URL environment variable, or pass --db-url=<url>"
        )

    demo_day = date.fromisoformat(args.demo_day)
    print(f"\n🔧  Seeding demo DB for {demo_day} …\n")

    conn = psycopg2.connect(args.db_url)
    conn.autocommit = False
    cur  = conn.cursor()

    print("▸ Creating schema (IF NOT EXISTS) …")
    cur.execute(DDL)

    print("▸ Truncating existing demo data …")
    cur.execute(TRUNCATE_SQL)

    print("▸ Seeding users …")
    user_ids = seed_users(cur, demo_day)

    print("▸ Seeding transactions …")
    txn_map = seed_transactions(cur, user_ids, demo_day)

    print("▸ Seeding score snapshots …")
    seed_score_snapshots(cur, user_ids, demo_day)

    print("▸ Seeding loans …")
    loan_ids = seed_loans(cur, user_ids, demo_day)

    print("▸ Seeding jobs …")
    job_ids = seed_jobs(cur, user_ids, demo_day)

    print("▸ Seeding job applications …")
    seed_job_applications(cur, user_ids, job_ids, demo_day)

    print("▸ Seeding lender wallets …")
    seed_lender_wallets(cur, user_ids)

    print("▸ Seeding fraud alerts …")
    seed_fraud_alerts(cur, user_ids, txn_map, demo_day)

    print("▸ Seeding forecasts …")
    seed_forecasts(cur, user_ids, txn_map, demo_day)

    conn.commit()
    cur.close()

    print("\n▸ Updating ML fixtures …")
    update_fixtures(demo_day)

    print("\n▸ Running assertions …")
    # Reopen a read cursor on committed data
    cur2 = conn.cursor()
    run_assertions(cur2, user_ids, loan_ids, job_ids, args.ml_url)
    cur2.close()
    conn.close()

    print("\n✓  Seeded successfully!\n")
    print("Next steps:")
    db_display = (args.db_url or "")[:40]
    print(f"  • Start backend with DB_SYNC=true against {db_display}…")
    print(f"  • Start ml_service pointing at the same DB")
    print(f"  • Demo day: {demo_day} — Tunde applies live to job {IYA_JOB_FIXTURE_ID}")


if __name__ == "__main__":
    main()
