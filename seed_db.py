import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv("backend/.env")

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "mediwaste_db")

async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DB_NAME]
    
    # 1. Clear staff and bins to apply user's specific request
    await db.staff.delete_many({})
    await db.bins.delete_many({})
    
    # Seed staff
    staff_seeds = [
        { "name": 'jay gupta', "ward": 'Radiology Ward', "floor": 1, "accuracy": 98.5, "items": 342, "rank": 1, "role": 'Waste Supervisor' },
        { "name": 'kishore sharma', "ward": 'Surgery Ward', "floor": 2, "accuracy": 97.2, "items": 428, "rank": 2, "role": 'Disposal Coordinator' },
        { "name": 'Asha pathak', "ward": 'ICU Ward', "floor": 1, "accuracy": 96.8, "items": 567, "rank": 3, "role": 'Segregation Officer' },
        { "name": 'Liu Wei', "ward": 'Cardiology', "floor": 3, "accuracy": 94.0, "items": 120, "rank": 4, "role": 'Ward Waste Officer' },
    ]
    await db.staff.insert_many(staff_seeds)
    
    # Seed bins
    bins_seeds = [
        { "id": "F11", "floor": 1, "roomId": "ER-1", "compartments": { "Infectious": 72, "Sharps": 91, "General": 40, "Chemical": 10 }, "worker": "jay gupta", "workerRole": "Waste Supervisor", "lastCollected": datetime.now(timezone.utc), "collections": 8, "status": "Full", "overallFill": 91 },
        { "id": "F12", "floor": 1, "roomId": "ER-1", "compartments": { "Infectious": 40, "Sharps": 20, "General": 72, "Chemical": 5 }, "worker": "Asha pathak", "workerRole": "Segregation Officer", "lastCollected": datetime.now(timezone.utc), "collections": 5, "status": "Active", "overallFill": 72 },
        { "id": "F21", "floor": 2, "roomId": "SURG-2", "compartments": { "Infectious": 67, "Sharps": 89, "General": 12, "Chemical": 4 }, "worker": "kishore sharma", "workerRole": "Disposal Coordinator", "lastCollected": datetime.now(timezone.utc), "collections": 9, "status": "Full", "overallFill": 89 }
    ]
    await db.bins.insert_many(bins_seeds)
    print("Database seeded with new staff and bins!")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed())
