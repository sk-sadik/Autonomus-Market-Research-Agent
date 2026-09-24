import os
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from dotenv import load_dotenv

# Ensure environment variables are loaded
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)

logger = logging.getLogger("backend.db.mongo_client")

# In-memory database fallback dictionary
_in_memory_jobs: Dict[str, Dict[str, Any]] = {}
_mongo_client = None
_db = None

async def init_db():
    global _mongo_client, _db
    mongo_uri = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
    db_name = os.environ.get("MONGO_DB_NAME", "autonomous_market_research")

    # Try primary MongoDB connection (with certifi for Atlas SSL support)
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        import certifi

        client_kwargs = {"serverSelectionTimeoutMS": 5000}
        if "mongodb+srv" in mongo_uri or "tls=true" in mongo_uri.lower() or "ssl=true" in mongo_uri.lower():
            client_kwargs["tlsCAFile"] = certifi.where()
            client_kwargs["tlsAllowInvalidCertificates"] = True

        client = AsyncIOMotorClient(mongo_uri, **client_kwargs)
        await client.admin.command('ping')
        _mongo_client = client
        _db = client.get_database(db_name)
        logger.info(f"Successfully connected to primary MongoDB database '{db_name}'.")
        return
    except Exception as e:
        logger.warning(f"Primary MongoDB connection failed ({e}). Trying fallback to local MongoDB...")

    # Fallback to local MongoDB if primary Atlas connection fails
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        local_uri = "mongodb://localhost:27017"
        client = AsyncIOMotorClient(local_uri, serverSelectionTimeoutMS=2000)
        await client.admin.command('ping')
        _mongo_client = client
        _db = client.get_database(db_name)
        logger.info(f"Successfully connected to local MongoDB fallback database '{db_name}'.")
        return
    except Exception as e:
        logger.warning(f"Local MongoDB connection also failed ({e}). Operating with in-memory job store.")
        _mongo_client = None
        _db = None

async def create_job(job_id: str, thread_id: str, startup_idea: str) -> Dict[str, Any]:
    job_doc = {
        "_id": job_id,
        "job_id": job_id,
        "thread_id": thread_id,
        "startup_idea": startup_idea,
        "status": "pending",
        "current_node": "planner_node",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "report_pdf_path": None,
        "chart_data": None,
        "error": None
    }
    if _db is not None:
        try:
            await _db.research_jobs.insert_one(job_doc)
            logger.info(f"Job '{job_id}' persisted into MongoDB database.")
        except Exception as e:
            logger.error(f"Error inserting job to Mongo: {e}")
    
    _in_memory_jobs[job_id] = job_doc
    return job_doc

async def update_job(job_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    updates["updated_at"] = datetime.utcnow().isoformat()
    if _db is not None:
        try:
            await _db.research_jobs.update_one({"_id": job_id}, {"$set": updates}, upsert=True)
            logger.info(f"Job '{job_id}' updated in MongoDB.")
        except Exception as e:
            logger.error(f"Error updating job in Mongo: {e}")
            
    if job_id in _in_memory_jobs:
        _in_memory_jobs[job_id].update(updates)
        return _in_memory_jobs[job_id]
    return None

async def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    if _db is not None:
        try:
            doc = await _db.research_jobs.find_one({"_id": job_id})
            if doc:
                return doc
        except Exception as e:
            logger.error(f"Error reading job from Mongo: {e}")
            
    return _in_memory_jobs.get(job_id)

async def get_all_jobs() -> List[Dict[str, Any]]:
    if _db is not None:
        try:
            jobs = await _db.research_jobs.find().to_list(length=200)
            return jobs
        except Exception as e:
            logger.error(f"Error fetching all jobs from Mongo: {e}")
    return list(_in_memory_jobs.values())

