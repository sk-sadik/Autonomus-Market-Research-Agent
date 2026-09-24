# Autonomus Market Research Agent — Frontend

React + TypeScript + Vite frontend with an Express development/production
server (`server.ts`) that proxies research requests to the Python FastAPI
backend.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set:
   - `GEMINI_API_KEY` — your Gemini API key
   - `FASTAPI_BACKEND_URL` — URL of the Python backend (default `http://127.0.0.1:8000`)
   - `FRONTEND_URL` — public URL of this frontend (used by backend CORS)
3. Run the app:
   `npm run dev`

## Production Build

```bash
npm run build
npm start   # serves dist/ via Express on $PORT (default 3000)
```

The Express server exposes:

- `POST /api/research/analyze` — runs research via the FastAPI backend
- `POST /api/agent/consult` — agent chatbot consultation
- `GET /api/preset-ideas` — preset research ideas
- `GET /api/jobs` — research jobs stored in MongoDB (via the backend)
- `GET /api/reports/:filename` — proxy PDF downloads from the backend