import os
import sys

# Ensure project root is in sys.path for absolute imports (from backend.xyz import ...)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import uuid
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from backend.db import mongo_client
from backend.agent_core import run_research_pipeline

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("backend.app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB connection on startup
    await mongo_client.init_db()
    yield

app = FastAPI(
    title="Autonomus Market Research Agent API",
    description="Multi-agent market intelligence platform powered by LangGraph, Tavily, and multi-provider LLMs",
    version="1.0.0",
    lifespan=lifespan
)

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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ResearchRequest(BaseModel):
    idea: str

@app.post("/research", status_code=202)
async def submit_research(req: ResearchRequest, background_tasks: BackgroundTasks):
    if not req.idea or not req.idea.strip():
        raise HTTPException(status_code=400, detail="Startup idea cannot be empty.")
        
    job_id = str(uuid.uuid4())
    thread_id = job_id
    
    # Save job record
    await mongo_client.create_job(job_id=job_id, thread_id=thread_id, startup_idea=req.idea)
    
    # Launch pipeline asynchronously in background
    background_tasks.add_task(run_research_pipeline, job_id, req.idea)
    
    return {
        "job_id": job_id,
        "status": "pending"
    }

@app.get("/research-jobs")
async def list_all_jobs():
    jobs = await mongo_client.get_all_jobs()
    # Sanitize _id for JSON serialization if present
    sanitized = []
    for j in jobs:
        doc = dict(j)
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        sanitized.append(doc)
    return {"jobs": sanitized, "count": len(sanitized)}

@app.get("/research/{job_id}")
async def get_research_status(job_id: str):
    job = await mongo_client.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Research job '{job_id}' not found.")
        
    status = job.get("status", "pending")
    response = {
        "job_id": job_id,
        "status": status,
        "current_node": job.get("current_node", "planner_node")
    }
    
    if status == "complete":
        response["report_pdf_path"] = job.get("report_pdf_path", f"/reports/{job_id}.pdf")
        response["chart_data"] = job.get("chart_data", {})
    elif status == "failed":
        response["error"] = job.get("error", "Unknown pipeline error")
        
    return response

@app.get("/reports/{filename}")
async def download_report_pdf(filename: str):
    reports_dir = os.path.join(os.path.dirname(__file__), "reports")
    file_path = os.path.join(reports_dir, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"PDF report '{filename}' not found.")
        
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=filename,
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.get("/")
async def root():
    return {
        "service": "Autonomus Market Research Agent API",
        "status": "operational",
        "docs": "/docs"
    }

