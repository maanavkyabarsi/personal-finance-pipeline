# Personal Finance Pipeline

An end-to-end pipeline that pulls your bank and card transactions from [Plaid](https://plaid.com/) into BigQuery, models them with dbt, and visualizes spending in a Next.js dashboard. Ingestion and transformation run on a schedule via Prefect.

```
Plaid webhook → ingestion (Cloud Function) → bronze.transactions (raw JSON)
   → dbt silver_transactions → dbt gold_spending_by_category
   → Next.js API routes → dashboard
```

## Architecture

| Layer | Path | What it does |
|---|---|---|
| **Ingestion** | `ingestion/main.py` | Google Cloud Function (`functions-framework`) that receives Plaid webhooks, calls `transactions_sync`, and writes raw JSON to BigQuery `bronze.transactions`. |
| **Transformation** | `dbt/` | dbt + BigQuery. `silver.transactions` parses and deduplicates the raw JSON; `gold.spending_by_category` aggregates monthly spend per account and category. |
| **Dashboard** | `dashboard/` | Next.js 16 / React 19 app. API routes query BigQuery directly; the UI derives trends, category breakdowns, and budget status client-side. |
| **Orchestration** | `prefect/flow.py` | Prefect flow that runs ingestion + dbt every 6 hours (`prefect.yaml`). |

### Data layers (BigQuery)

- `bronze.transactions` — `raw_data` (JSON string), `ingested_at` (timestamp)
- `silver.transactions` — parsed, typed, deduplicated by `transaction_id`
- `gold.spending_by_category` — monthly spend by `account_id` + Plaid category
- `gold.budget_limits` — per-category monthly budgets (set from the dashboard)

## Prerequisites

- A **Google Cloud project** with BigQuery enabled and the `bronze` / `silver` / `gold` datasets, plus application default credentials (ADC) configured locally (`gcloud auth application-default login`).
- A **Plaid** account (Production) with linked items.
- **Secrets in GCP Secret Manager:**
  - `plaid-client-id`, `plaid-secret` — Plaid API credentials
  - `plaid-item-map` — JSON mapping each Plaid `item_id` → the secret name holding that item's access token
  - one access-token secret per item (named as referenced by `plaid-item-map`)
  - `plaid-cursor-{item_id}` — created/updated automatically as sync cursors advance
- Python 3.12+ and Node.js 18+.

## Setup & running

### Ingestion

```bash
cd ingestion
python -m venv .venv && source .venv/bin/activate
pip install -r ../requirements.txt

# Set PROJECT_ID in ingestion/.env, then run the webhook handler locally:
functions-framework --target handle_webhook --port 8080
```

The handler accepts Plaid `TRANSACTIONS` / `SYNC_UPDATES_AVAILABLE` webhooks, syncs new transactions (paginating until Plaid has no more), writes them to `bronze.transactions`, and saves the new cursor back to Secret Manager.

### dbt

```bash
# Requires the PROJECT_ID env var. The profile authenticates to BigQuery via oauth (ADC).
dbt run --project-dir dbt --profiles-dir dbt/profiles

# Build a single model:
dbt run --select silver_transactions --project-dir dbt --profiles-dir dbt/profiles
```

Models materialize as tables in the literal `silver` / `gold` datasets (a custom `generate_schema_name` macro disables dbt's default schema prefixing).

### Orchestration (Prefect)

```bash
prefect deploy --all      # deploy the flow per prefect.yaml
python prefect/flow.py     # or run the sync manually
```

The deployed flow loads a service-account key from the `gcp-sa-key` Prefect Secret block at runtime, derives the GCP project from it, runs ingestion for every item in `plaid-item-map`, then runs dbt. It is scheduled every 6 hours.

### Dashboard

```bash
cd dashboard
npm install
npm run dev      # http://localhost:3000
```

Create `dashboard/.env.local` with:

```
GCP_SERVICE_ACCOUNT_KEY={...the JSON service account key as a single-line string...}
GCP_PROJECT_ID=your-gcp-project-id
```

Other scripts: `npm run build` (production build + type-check), `npm run lint`.

The dashboard has three views — **Overview** (KPIs, spending trend, category breakdown), **Categories** (per-category drill-down into transactions), and **Budgets** (set/track monthly limits) — with light and dark themes.

> **Note:** the dashboard targets **Next.js 16 / React 19**, whose conventions can differ from older docs. See `dashboard/AGENTS.md`.

## Repository layout

```
ingestion/      Plaid webhook handler (Cloud Function)
dbt/            dbt project (silver + gold models, profiles, macros)
prefect/        Prefect flow + scheduling
dashboard/      Next.js app (API routes + SPA)
requirements.txt  Python deps for ingestion, dbt, and Prefect
prefect.yaml    Prefect deployment + schedule
```
