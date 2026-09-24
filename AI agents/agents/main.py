"""
Autonomus Market Research Agent -- Agents Service

FastAPI microservice that runs the multi-agent research pipeline and returns
data in the exact shape the frontend expects. Can be:

  (a) called directly by the frontend (point its dev proxy / fetch base at
      this service instead of / in addition to server.ts), or
  (b) called by the main backend, which forwards the request here and
      relays the response -- e.g. `requests.post("http://agents:8001/api/research/analyze", json=body)`.

Run:
    uvicorn main:app --reload --port 8001

Endpoints:
    GET  /api/health
    GET  /api/preset-ideas               (mirrors server.ts)
    POST /api/research/analyze           (mirrors server.ts -- same request/response contract)
    POST /api/research/pdf               (NEW: returns a real server-rendered PDF with charts)
    GET  /api/research/report/{id}       (fetch a previously generated report from the in-memory cache)
"""
from __future__ import annotations
import os
import logging
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from dotenv import load_dotenv

load_dotenv()

from models import StartupIdeaInput, AnalyzeResponse, ResearchReport
from pipeline.orchestrator import run_pipeline
from pdf.pdf_builder import build_pdf

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s")
logger = logging.getLogger("agents.main")

app = FastAPI(title="Autonomus Market Research Agent - Agents Service")

# CORS: restrict to configured frontend origin(s) in production.
# For local development, falls back to allowing all origins.
FRONTEND_URL = os.environ.get("FRONTEND_URL", "").strip()
if FRONTEND_URL:
    allow_origins = [origin.strip() for origin in FRONTEND_URL.split(",") if origin.strip()]
else:
    allow_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory cache so /api/research/pdf can regenerate a PDF for a report
# id without re-running the whole pipeline. Swap for Redis/DB if you need it to
# survive a restart.
_REPORT_CACHE: dict[str, ResearchReport] = {}


@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/api/preset-ideas")
def preset_ideas():
    try:
        from data.preset_ideas import PRESET_IDEAS
        return {"success": True, "presets": PRESET_IDEAS}
    except ImportError:
        return {"success": True, "presets": []}


@app.post("/api/research/analyze", response_model=AnalyzeResponse)
def analyze(input: StartupIdeaInput):
    logger.info('Starting research pipeline for: "%s"', input.title)
    try:
        report = run_pipeline(input)
        _REPORT_CACHE[report.id] = report
        return AnalyzeResponse(success=True, report=report)
    except Exception as exc:  # noqa: BLE001
        logger.exception("Pipeline failed")
        raise HTTPException(
            status_code=500,
            detail={"error": "Failed to generate market research report.", "details": str(exc)},
        )


@app.get("/api/research/report/{report_id}", response_model=AnalyzeResponse)
def get_report(report_id: str):
    report = _REPORT_CACHE.get(report_id)
    if not report:
        raise HTTPException(status_code=404, detail={"error": "Report not found."})
    return AnalyzeResponse(success=True, report=report)


@app.post("/api/research/pdf")
def export_pdf(report: ResearchReport):
    """Accepts a full ResearchReport JSON body (e.g. straight from the
    frontend's saved report state) and returns a real PDF with server-rendered
    charts as application/pdf bytes."""
    try:
        pdf_bytes = build_pdf(report)
    except Exception as exc:  # noqa: BLE001
        logger.exception("PDF build failed")
        raise HTTPException(status_code=500, detail={"error": "Failed to build PDF.", "details": str(exc)})

    filename = f"{report.startupInput.title.replace(' ', '_')}_Market_Research_Report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/api/research/report/{report_id}/pdf")
def export_pdf_by_id(report_id: str):
    """Convenience GET: build the PDF for an already-generated report id."""
    report = _REPORT_CACHE.get(report_id)
    if not report:
        raise HTTPException(status_code=404, detail={"error": "Report not found."})
    pdf_bytes = build_pdf(report)
    filename = f"{report.startupInput.title.replace(' ', '_')}_Market_Research_Report.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
