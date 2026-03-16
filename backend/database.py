"""
MediWaste AI – MongoDB Atlas Connection Module
Uses motor (async MongoDB driver) for FastAPI compatibility.
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "")
DB_NAME = os.getenv("DB_NAME", "mediwaste_db")

client: AsyncIOMotorClient = None
db = None


async def connect_to_mongo():
    """Connect to MongoDB Atlas and initialize the shared db instance."""
    global client, db
    if not MONGODB_URL:
        print("WARNING: MONGODB_URL not set in .env file!")
        return False
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DB_NAME]
        # Verify connection
        await client.admin.command("ping")
        print(f"[OK] Connected to MongoDB Atlas – database: {DB_NAME}")
        return True
    except Exception as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
        return False


async def create_indexes():
    """Create database indexes for optimized queries."""
    if db is None:
        return
    try:
        # Users: unique email
        await db.users.create_index("email", unique=True)
        # Scans: query by user and sort by time
        await db.scans.create_index("user_id")
        await db.scans.create_index("timestamp")
        await db.scans.create_index("hospital_id")
        # Activity logs: query by user and time
        await db.activity_logs.create_index("user_id")
        await db.activity_logs.create_index("timestamp")
        print("[OK] Database indexes created")
    except Exception as e:
        print(f"[WARNING] Index creation: {e}")


async def close_mongo_connection():
    """Close the MongoDB connection."""
    global client
    if client:
        client.close()
        print("[OK] MongoDB connection closed")


def get_db():
    """Get the shared database instance."""
    return db
