-- Migration 002: cash-flow forecast cache and dip warning tables
-- Run once against your Postgres database before starting the ml_service.

CREATE TABLE IF NOT EXISTS forecasts (
    user_id           TEXT        NOT NULL,
    forecast_date     DATE        NOT NULL,
    fit_at            TIMESTAMPTZ NOT NULL,
    predicted_inflow  BIGINT      NOT NULL,  -- kobo
    lower_bound_80    BIGINT      NOT NULL,  -- kobo, 80% interval lower
    upper_bound_80    BIGINT      NOT NULL,  -- kobo, 80% interval upper
    model_version     TEXT        NOT NULL,
    PRIMARY KEY (user_id, forecast_date)
);

CREATE INDEX IF NOT EXISTS idx_forecasts_user_fit
    ON forecasts (user_id, fit_at DESC);

CREATE TABLE IF NOT EXISTS dip_warnings (
    id                  BIGSERIAL   PRIMARY KEY,
    user_id             TEXT        NOT NULL,
    detected_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dip_start_date      DATE        NOT NULL,
    dip_end_date        DATE        NOT NULL,
    expected_gap_kobo   BIGINT      NOT NULL,
    suggested_loan_kobo BIGINT      NOT NULL,
    severity            TEXT        NOT NULL,  -- 'low' | 'medium' | 'high'
    offer_state         TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (offer_state IN ('pending', 'sent', 'accepted', 'declined', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_dip_warnings_user_recent
    ON dip_warnings (user_id, detected_at DESC);
