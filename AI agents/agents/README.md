# Agents Service — Autonomus Market Research Agent

Python/FastAPI microservice implementing the actual multi-agent pipeline for
automated market research. It runs independently of `frontend/` and
`backend/`, and can be called by the main backend as an internal service, or
by the frontend directly.

## Why multiple agents instead of one big prompt?

The single-call prototype (`frontend/src/utils/geminiServer.ts`) asks Gemini
for the *entire* report in one call. That's fast, but nothing forces the
competitor pricing, review complaints, TAM, and SWOT sections to agree.

This service runs **7 chained agents**, each a focused Gemini call whose
output feeds the next agent as grounding context:

```
1. Discovery Agent      -> finds & profiles 3 competitors (pricing, ratings, revenue)
2. Review Agent         -> synthesizes sentiment, GROUNDED in those competitors' weaknesses
3. Market Sizing Agent  -> TAM/SAM/SOM, GROUNDED in competitor revenue/share
4. Strategy Agent       -> SWOT + Porter's 5 Forces, GROUNDED in sentiment + market data
5. Finance Agent        -> unit economics, GROUNDED in market SOM ceiling
6. Executive Agent      -> final Opportunity Score & verdict, GROUNDED in everything above
7. Report Writer Agent  -> compiles the 20-page dossier from ALL prior findings
```

Every stage is logged into `agentExecutionLog`, which is exactly what the
frontend's `AgentPipelineConsole` component displays.

## Setup

```bash
cd agents
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste your GEMINI_API_KEY (https://aistudio.google.com/apikey)
```

## Run

```bash
uvicorn main:app --reload --port 8001
```

Quick local test without a server at all:

```bash
python test_pipeline.py
# writes sample_report.json and sample_report.pdf
```

## API contract

### `POST /api/research/analyze`
Same request/response shape as the existing `frontend/server.ts` endpoint —
this is a **drop-in**.

Request body:
```json
{
  "title": "ShelfSense AI",
  "description": "...",
  "targetIndustry": "Retail Technology",
  "targetRegion": "North America",
  "businessModel": "B2B",
  "targetPriceRange": "$99-$499/mo",
  "depthLevel": "exhaustive_20_page"
}
```

Response: `{ "success": true, "report": { ...ResearchReport } }` — field
names match `frontend/src/types.ts` exactly, so the response can be handed
straight to `setActiveReport()` in `App.tsx` with zero transformation.

### `POST /api/research/pdf`
Accepts a full `ResearchReport` JSON body and returns a real, server-rendered
20-page PDF (`application/pdf`) with matplotlib charts embedded as images.
Much smaller file size than a screenshot-based export and works headlessly
(e.g. to email a report or store in S3).

### `GET /api/research/report/{id}` and `GET /api/research/report/{id}/pdf`
Convenience — re-fetch a report or its PDF from the in-memory cache without
re-running the pipeline.

## Integrating with the main backend

Two ways to wire this in:

**A. Backend proxies to this service** (recommended — keeps one public API surface):
```python
# in the backend
import requests
resp = requests.post("http://localhost:8001/api/research/analyze", json=body)
return resp.json()
```

**B. Frontend calls this service directly** for the research/PDF endpoints,
and the backend only handles other concerns (auth, saved reports, billing,
etc). Point the frontend's fetch calls at `http://localhost:8001/api/...`
instead of the relative `/api/...` (or reverse-proxy `/api/research/*` to
port 8001 — e.g. nginx or Vite's dev proxy).

## Files

```
agents/
├── main.py                    FastAPI app (all endpoints)
├── models.py                  Pydantic schemas mirroring frontend/src/types.ts
├── test_pipeline.py           CLI test, no server needed
├── requirements.txt
├── .env.example
├── pipeline/
│   ├── gemini_client.py       shared structured-output Gemini wrapper
│   ├── discovery_agent.py     Agent 1
│   ├── review_agent.py        Agent 2
│   ├── market_sizing_agent.py Agent 3
│   ├── strategy_agent.py      Agent 4 (SWOT + Porter)
│   ├── finance_agent.py       Agent 5
│   ├── summary_agent.py       Agent 6
│   ├── report_writer_agent.py Agent 7 (20 pages)
│   └── orchestrator.py        runs 1-7 in sequence, builds the log
└── pdf/
    ├── chart_utils.py         matplotlib chart renderers (one per chartType)
    └── pdf_builder.py         reportlab 20-page PDF assembly
```

## Notes

- Default model is `gemini-2.5-flash` (set `GEMINI_MODEL` in `.env` to change).
- The pipeline makes **8 sequential Gemini calls** per report (discovery,
  review, market sizing, strategy, finance, summary, + 2 report-writer
  batches). Expect ~20-40s end-to-end depending on model/load — the
  frontend's pipeline console simulates progress while it waits.
- CORS is wide open (`allow_origins=["*"]`) unless `FRONTEND_URL` is set in
  `.env`; set it to your deployed frontend origin before any real deployment.
- If Gemini returns malformed JSON, `gemini_client.py` retries once, then
  raises — the `/api/research/analyze` endpoint turns that into a clean
  `500` with `{error, details}`, matching the existing `server.ts` error shape.