import asyncio
import os
import json
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import certifi

# Load environment variables from backend/.env
env_path = os.path.join(os.path.dirname(__file__), "backend", ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)

async def check_target(uri: str, db_name: str, label: str):
    print(f"Checking {label} at: {uri} (Database: {db_name})...")
    client_kwargs = {"serverSelectionTimeoutMS": 4000}
    if "mongodb+srv" in uri or "tls=true" in uri.lower() or "ssl=true" in uri.lower():
        client_kwargs["tlsCAFile"] = certifi.where()
        client_kwargs["tlsAllowInvalidCertificates"] = True

    try:
        client = AsyncIOMotorClient(uri, **client_kwargs)
        await client.admin.command('ping')
        print(f"Connected to {label} successfully!")

        db = client.get_database(db_name)
        jobs = await db.research_jobs.find().to_list(length=100)

        print(f"Total Research Jobs stored in [{label} -> {db_name}]: {len(jobs)}")
        print("=" * 60)

        for idx, job in enumerate(jobs, 1):
            print(f"[{idx}] Job ID:      {job.get('job_id')}")
            print(f"    Startup Idea: {job.get('startup_idea')}")
            print(f"    Status:       {job.get('status')}")
            print(f"    Created At:   {job.get('created_at')}")
            print(f"    PDF Report:   {job.get('report_pdf_path')}")
            if job.get("error"):
                print(f"    Error:        {job.get('error')}")
            print("-" * 60)
        return len(jobs)
    except Exception as e:
        print(f"Could not connect to {label}: {e}\n")
        return 0

async def main():
    atlas_uri = os.environ.get("MONGO_URI", "")
    db_name = os.environ.get("MONGO_DB_NAME", "autonomous_market_research")

    found = 0
    if atlas_uri:
        found += await check_target(atlas_uri, db_name, "MongoDB Atlas (Primary)")

    found += await check_target("mongodb://localhost:27017", db_name, "Local MongoDB (Fallback)")

    if found == 0:
        print("\nSummary: No jobs currently found in Database.")
        print("Run a research job (e.g. `python run_research.py \"My Test Startup Idea\"`) to store new research details in the DB.")

if __name__ == "__main__":
    asyncio.run(main())

