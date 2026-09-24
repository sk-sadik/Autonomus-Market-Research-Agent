import os
import sys
import asyncio
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "backend", ".env"))

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("run_research")

from backend.db import mongo_client
from backend.agent_core import run_research_pipeline

async def main():
    idea = sys.argv[1] if len(sys.argv) > 1 else "Autonomous AI Agent for Automated Boutique Retail Inventory Management & Demand Forecasting"
    logger.info(f"Starting Autonomus Market Research Agent Test for idea:\n'{idea}'\n")

    # Initialize DB
    await mongo_client.init_db()

    job_id = "test-job-001"
    await mongo_client.create_job(job_id=job_id, thread_id=job_id, startup_idea=idea)

    logger.info(f"Executing LangGraph pipeline for job_id={job_id}...")
    await run_research_pipeline(job_id=job_id, startup_idea=idea)

    # Check status
    job = await mongo_client.get_job(job_id)
    print("\n" + "="*70)
    print("PIPELINE EXECUTION COMPLETE")
    print("="*70)
    if job:
        print(f"Job ID:          {job.get('job_id')}")
        print(f"Status:          {job.get('status')}")
        print(f"Current Node:    {job.get('current_node')}")
        print(f"Report PDF Path: {job.get('report_pdf_path')}")
        print(f"Chart Data:      {job.get('chart_data')}")
        if job.get("error"):
            print(f"Error:           {job.get('error')}")
    print("="*70)

    pdf_full_path = os.path.join(os.path.dirname(__file__), "backend", "reports", f"{job_id}.pdf")
    if os.path.exists(pdf_full_path):
        print(f"\nSUCCESS: PDF file generated at:\n{pdf_full_path}")
        print(f"File size: {os.path.getsize(pdf_full_path)} bytes")
    else:
        print("\nFAILURE: PDF file was not created.")

if __name__ == "__main__":
    asyncio.run(main())
