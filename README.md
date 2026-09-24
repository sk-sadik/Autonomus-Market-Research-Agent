# Autonomus Market Research Agent

## Description

Autonomus Market Research Agent is a multi-agent market intelligence platform.
It takes a startup business idea and autonomously produces a comprehensive
20-page market research PDF report: it plans and runs web searches, profiles
competitors and their pricing, synthesizes customer review sentiment, models
TAM/SAM/SOM, builds SWOT and Porter's Five Forces analysis, projects unit
economics, and compiles everything into a professional, chart-rich dossier.

The application runs as three cooperating parts:

- a React + TypeScript + Vite **frontend** with an Express server
- a Python **FastAPI + LangGraph backend** that orchestrates the research
  pipeline, persists jobs in MongoDB, and assembles the PDF report
- a standalone **agents microservice** implementing a 7-agent Gemini pipeline
  that generates the full report with a server-side 20-page PDF

## Technologies

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Express
- **Backend:** Python, FastAPI, LangGraph, Motor (async MongoDB driver)
- **Database:** MongoDB (MongoDB Atlas for production, local MongoDB for dev)
- **AI/LLM:** Google Gemini (google-genai SDK)
- **Search:** Tavily API (web search) with offline fallback
- **Reporting:** ReportLab + Matplotlib (server-rendered PDF with charts)

## Features

- Startup idea intake with preset market examples
- Autonomous multi-agent research pipeline (planner → scrape → analyze →
  synthesize → report writer)
- Competitor discovery, pricing matrix extraction, and review sentiment mining
- Market sizing (TAM/SAM/SOM) and financial/unit-economics modeling
- Live agent execution console UI
- Saved reports persisted to MongoDB
- 20-page market research PDF reports with embedded charts
- Agent consultation chat (Competitor / Pricing / Review agents)
- Interactive market studio sandbox

## Project Structure

```
.
├── frontend/                 React + Vite + Express application
│   ├── src/components/       UI components
│   ├── src/utils/            Gemini report generation, fallback, PDF export
│   ├── server.ts             Express server (API + static hosting)
│   └── package.json
├── backend/                  FastAPI + LangGraph research backend
│   ├── app.py                FastAPI app (REST endpoints, CORS)
│   ├── agent_core.py         LangGraph pipeline nodes
│   ├── db/mongo_client.py    MongoDB persistence layer
│   ├── models/               LLM clients (Gemini, MiniMax, Nemotron)
│   ├── tools/tavily_search.py
│   └── report/               Matplotlib charts + ReportLab PDF assembly
├── "AI agents"/agents/       Standalone 7-agent FastAPI microservice
│   └── pipeline/             discovery, review, sizing, strategy, finance,
│                             summary, report-writer agents
├── reports/                  Generated chart/report outputs
├── run_research.py           CLI runner for the backend pipeline
├── check_db.py               Inspect research jobs stored in MongoDB
├── Dockerfile                Frontend container build
└── render.yaml               Render.com deployment blueprint
```

## Local Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/sk-sadik/Autonomus-Market-Research-Agent.git
   cd market-research-agent-main
   ```

2. **Frontend dependencies**

   ```bash
   cd frontend
   npm install
   ```

3. **Backend dependencies** (Python 3.10+)

   ```bash
   cd ../backend
   python -m venv .venv
   .venv\Scripts\activate          # Windows
   # source .venv/bin/activate     # macOS / Linux
   pip install -r requirements.txt
   ```

4. **Configure `.env`**

   Copy each `.env.example` to `.env` and fill in your values:
   - `backend/.env`
   - `frontend/.env.local`
   - `AI agents/agents/.env`

5. **MongoDB**

   Point `MONGO_URI` at your local MongoDB or MongoDB Atlas cluster and set
   `MONGO_DB_NAME` to your database name. The backend connects and falls back
   to an in-memory store if MongoDB is unreachable.

6. **Start the Python backend**

   ```bash
   cd backend
   uvicorn app:app --reload --port 8000
   ```

7. **Start the frontend/Node server**

   ```bash
   cd frontend
   npm run dev
   ```

   Open http://127.0.0.1:3000 in your browser.

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `TAVILY_API_KEY` | No | Tavily web search API key (falls back to simulated results) |
| `MONGO_URI` | No | MongoDB connection string (defaults to `mongodb://localhost:27017`) |
| `MONGO_DB_NAME` | No | MongoDB database name |
| `FASTAPI_BACKEND_URL` | No | Python backend URL used by the frontend (default `http://127.0.0.1:8000`) |
| `FRONTEND_URL` | No | Public frontend URL for backend CORS (defaults to allow-all in dev) |
| `PORT` | No | Port for the Express server (default `3000`) |

Set real values only in local `.env` files — never commit them.

## Deployment

- **Frontend:** build with `npm run build` and run `npm start`; the Express
  server serves the static bundle and proxies API calls to the backend. Set
  `PORT`, `FASTAPI_BACKEND_URL`, and `FRONTEND_URL`.
- **Backend:** run with `uvicorn app:app --host 0.0.0.0 --port $PORT`; set
  `MONGO_URI`, `MONGO_DB_NAME`, `GEMINI_API_KEY`, `TAVILY_API_KEY`, and
  `FRONTEND_URL`.
- **Agents microservice:** run with `uvicorn main:app --host 0.0.0.0 --port
  $PORT`; set `GEMINI_API_KEY` and `FRONTEND_URL`.

A `Dockerfile` and `render.yaml` are included for the frontend on
Render.com-style platforms.