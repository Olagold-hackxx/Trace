# KudiScore Backend

NestJS backend for the KudiScore platform.

## Stack

- NestJS
- PostgreSQL
- Redis
- Docker Compose
- TypeORM

## What is included

- Auth, users, and virtual account modules
- Payments, transactions, score, loans, jobs, lender, admin, and Squad webhook modules
- Redis-backed realtime event publisher for SSE
- Postgres entities for the first product surfaces already present in `frontend/`
- Docker setup for API, Postgres, and Redis

## Run locally

From repo root:

```bash
docker compose up --build
```

API runs on `http://localhost:3001`.

Set either `DATABASE_URL` or the split `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/`DB_PASSWORD` variables before starting the service outside Docker Compose.

## Important current notes

- This is the backend foundation and route surface. ML scoring, SHAP generation, fraud inference, and forecasting are still expected to be integrated later from `ml_service/`.
- The Squad webhook route exists at `POST /webhooks/squad`, but raw-body signature verification is still a follow-up task before production use.
- `DB_SYNC=true` is enabled for fast local iteration. Replace that with migrations before hardening the service.

## Main route groups

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`
- `GET /api/v1/virtual-accounts/me`
- `GET /api/v1/transactions`
- `GET /api/v1/transactions/summary`
- `GET /api/v1/score`
- `GET /api/v1/loans/offers`
- `POST /api/v1/loans/applications`
- `GET /api/v1/jobs/mine`
- `GET /api/v1/marketplace/jobs`
- `GET /api/v1/lender/portfolio/summary`
- `GET /api/v1/admin/overview`
- `POST /webhooks/squad`
