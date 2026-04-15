import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv("backend/.env")
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "mediwaste_db")

async def update_db():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    # Delete Liu Wei
    await db.staff.delete_many({"name": "Liu Wei"})
    
    # Assign Asha to Floor 3
    await db.staff.update_one({"name": "Asha pathak"}, {"$set": {"floor": 3}})
    # Assign Jay to Floor 1
    await db.staff.update_one({"name": "jay gupta"}, {"$set": {"floor": 1}})
    # Assign Kishore to Floor 2
    await db.staff.update_one({"name": "kishore sharma"}, {"$set": {"floor": 2}})
    
    # Update bins assignment based on floor
    await db.bins.update_many({"floor": 1}, {"$set": {"worker": "jay gupta", "workerRole": "Waste Supervisor"}})
    await db.bins.update_many({"floor": 2}, {"$set": {"worker": "kishore sharma", "workerRole": "Disposal Coordinator"}})
    await db.bins.update_many({"floor": 3}, {"$set": {"worker": "Asha pathak", "workerRole": "Segregation Officer"}})
    
    print("DB state fixed: 1 staff per floor, Liu Wei removed.")
    client.close()

if __name__ == "__main__":
    asyncio.run(update_db())
