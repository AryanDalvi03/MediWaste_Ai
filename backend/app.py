import os
import math
import random
import warnings
from datetime import datetime, timezone
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from mediwaste_inference_7364 import MediWaste7364Engine

# Suppress warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

app = FastAPI(title="MediWaste AI Scanner Engine")

# Configure CORS - allow_credentials must be False when allow_origins=["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global hybrid engine
engine = None

CURRENT_FOLDER = os.path.dirname(os.path.abspath(__file__))


def load_engine():
    global engine
    model_path = os.path.join(CURRENT_FOLDER, 'efficientnet_finetuned_model.keras')
    scaler_path = os.path.join(CURRENT_FOLDER, 'rf_finetuned_features_scaler1.joblib')
    classifier_path = os.path.join(CURRENT_FOLDER, 'rf_finetuned_features_classifier1.joblib')

    missing = [
        os.path.basename(f) for f in [model_path, scaler_path, classifier_path]
        if not os.path.exists(f)
    ]
    if missing:
        print(f"CRITICAL: Missing files: {missing}")
        return False

    try:
        engine = MediWaste7364Engine(model_path, classifier_path, scaler_path)
        print("All models loaded via Hybrid 7364 Engine.")
        return True
    except Exception as e:
        print(f"Error loading models: {e}")
        return False


from database import connect_to_mongo, close_mongo_connection, create_indexes
from database import get_db


class ScanCreate(BaseModel):
    waste_type: str
    confidence: float
    disposal_bin: str
    hazard_status: str
    ward_name: str | None = None
    hospital_id: str | None = None
    user_email: str | None = None
    feature_dim: int | None = None

class WorkLogCreate(BaseModel):
    staff_email: str
    staff_name: str
    action: str  # 'bin_collected' | 'waste_disposed' | 'noted'
    note: str | None = None

@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    await create_indexes()
    load_engine()

    db = get_db()
    if db is not None:
        # Seed staff if empty
        if await db.staff.count_documents({}) == 0:
            staff_seeds = [
              { "name": 'Sarah Johnson', "ward": 'Radiology Ward', "floor": 1, "accuracy": 98.5, "items": 342, "rank": 1, "role": 'Waste Supervisor' },
              { "name": 'Ahmed Hassan', "ward": 'Surgery Ward', "floor": 2, "accuracy": 97.2, "items": 428, "rank": 2, "role": 'Disposal Coordinator' },
              { "name": 'Patricia Lee', "ward": 'ICU Ward', "floor": 1, "accuracy": 96.8, "items": 567, "rank": 3, "role": 'Segregation Officer' },
              { "name": 'Liu Wei', "ward": 'Cardiology', "floor": 2, "accuracy": 94.0, "items": 120, "rank": 4, "role": 'Ward Waste Officer' },
            ]
            await db.staff.insert_many(staff_seeds)
            
        # Seed bins if empty
        if await db.bins.count_documents({}) == 0:
            bins_seeds = [
              { "id": "F11", "floor": 1, "roomId": "ER-1", "compartments": { "Infectious": 72, "Sharps": 91, "General": 40, "Chemical": 10 }, "worker": "Sarah Johnson", "workerRole": "Waste Supervisor", "lastCollected": datetime.now(timezone.utc), "collections": 8, "status": "Full", "overallFill": 91 },
              { "id": "F12", "floor": 1, "roomId": "ER-1", "compartments": { "Infectious": 40, "Sharps": 20, "General": 72, "Chemical": 5 }, "worker": "Raj Patel", "workerRole": "Disposal Tech", "lastCollected": datetime.now(timezone.utc), "collections": 5, "status": "Active", "overallFill": 72 },
              { "id": "F21", "floor": 2, "roomId": "SURG-2", "compartments": { "Infectious": 67, "Sharps": 89, "General": 12, "Chemical": 4 }, "worker": "Ahmed Hassan", "workerRole": "Disposal Coordinator", "lastCollected": datetime.now(timezone.utc), "collections": 9, "status": "Full", "overallFill": 89 }
            ]
            await db.bins.insert_many(bins_seeds)


@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()


@app.get("/")
def read_root():
    return {"status": "online", "message": "MediWaste AI Engine Ready (Hybrid 7364)"}


@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    global engine
    if engine is None:
        if not load_engine():
            raise HTTPException(status_code=500, detail="Models not loaded")

    try:
        contents = await file.read()
        result = engine.predict(contents)

        predicted_class = result["type"]
        confidence = result["confidence"]

        waste_info = get_waste_info(predicted_class)
        timestamp = datetime.now().strftime("%d/%m/%Y, %I:%M:%S %p")

        return {
            "class": predicted_class,
            "confidence": confidence,
            "disposal_bin": waste_info["bin"],
            "hazard_status": waste_info["status"],
            "timestamp": timestamp,
            "raw_class_id": int(engine.classes.index(predicted_class)),
            "feature_dim": result["vector_dim"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/scans")
async def create_scan(scan: ScanCreate):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")

    doc = {
        "waste_type": scan.waste_type,
        "confidence": float(scan.confidence),
        "disposal_bin": scan.disposal_bin,
        "hazard_status": scan.hazard_status,
        "ward_name": scan.ward_name,
        "hospital_id": scan.hospital_id,
        "user_email": scan.user_email,
        "feature_dim": scan.feature_dim,
        "timestamp": datetime.now(timezone.utc),
    }
    res = await db.scans.insert_one(doc)
    return {"id": str(res.inserted_id)}


@app.get("/api/scans/recent")
async def get_recent_scans(limit: int = 25):
    db = get_db()
    if db is None:
        return []

    limit = max(1, min(int(limit), 200))
    cursor = db.scans.find({}, sort=[("timestamp", -1)]).limit(limit)
    items = []
    async for d in cursor:
        ts = d.get("timestamp")
        if isinstance(ts, datetime):
            ts_ms = int(ts.timestamp() * 1000)
        else:
            ts_ms = int(datetime.now(timezone.utc).timestamp() * 1000)

        items.append(
            {
                "id": str(d.get("_id")),
                "waste_type": d.get("waste_type", ""),
                "confidence": float(d.get("confidence", 0)),
                "disposal_bin": d.get("disposal_bin", ""),
                "hazard_status": d.get("hazard_status", ""),
                "ward_name": d.get("ward_name"),
                "hospital_id": d.get("hospital_id"),
                "user_email": d.get("user_email"),
                "timestamp": ts_ms,
                "feature_dim": d.get("feature_dim"),
            }
        )
    return items


def get_waste_info(class_name):
    mapping = {
        '(ME) Metal': {"bin": "Recycling Bin (Blue)", "status": "Non-Hazardous"},
        '(OW) Organic': {"bin": "Organic Bin (Green)", "status": "Non-Hazardous"},
        '(PE) Plastic': {"bin": "Recycling Bin (Blue)", "status": "Non-Hazardous"},
        '(PP) Paper': {"bin": "Paper Bin (Blue)", "status": "Non-Hazardous"},
        '(SN) Needle': {"bin": "Red Sharps Bin", "status": "Hazardous"},
        'Body Tissue': {"bin": "Yellow Biohazard Bin", "status": "Hazardous"},
        'Gauze': {"bin": "Yellow Biohazard Bin", "status": "Hazardous"},
        'Glass': {"bin": "Red Sharps Bin", "status": "Hazardous"},
        'Gloves': {"bin": "Yellow Biohazard Bin", "status": "Hazardous"},
        'Mask': {"bin": "Yellow Biohazard Bin", "status": "Hazardous"},
        'Syringe': {"bin": "Red Sharps Bin", "status": "Hazardous"},
        'Tweezers': {"bin": "Red Sharps Bin", "status": "Hazardous"},
    }
    return mapping.get(class_name, {"bin": "General Waste", "status": "Unknown"})


def generate_reports_data(period: str):
    """Generate comprehensive report data with server-side calculations."""
    random.seed(42)  # Consistent results

    # --- SECTION 1: Waste Generation Overview ---
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    base_monthly = [820, 780, 850, 900, 870, 920, 950, 980, 910, 890, 860, 940]
    current_year_monthly = [v + random.randint(-30, 60) for v in base_monthly]
    prev_year_monthly = [v - random.randint(40, 100) for v in base_monthly]

    total_current = sum(current_year_monthly)
    total_prev = sum(prev_year_monthly)
    yearly_growth = round(((total_current - total_prev) / total_prev) * 100, 1)
    beds = 250
    days_in_year = 365
    waste_per_bed_day = round(total_current / (beds * days_in_year), 2)

    monthly_data = []
    for i, m in enumerate(months):
        monthly_data.append({
            "month": m,
            "current": current_year_monthly[i],
            "previous": prev_year_monthly[i],
        })

    # --- SECTION 2: Growth & Trend Analysis ---
    mom_growth = []
    for i in range(1, 12):
        g = round(((current_year_monthly[i] - current_year_monthly[i - 1]) /
                    current_year_monthly[i - 1]) * 100, 1)
        mom_growth.append({"month": months[i], "growth": g})

    yearly_totals = {
        "2022": round(total_prev * 0.88),
        "2023": round(total_prev * 0.94),
        "2024": total_prev,
        "2025": total_current,
    }
    yoy_growth = []
    years_list = list(yearly_totals.keys())
    for i in range(1, len(years_list)):
        prev_val = yearly_totals[years_list[i - 1]]
        curr_val = yearly_totals[years_list[i]]
        yoy_growth.append({
            "year": years_list[i],
            "growth": round(((curr_val - prev_val) / prev_val) * 100, 1),
        })

    avg_growth_rate = sum(y["growth"] for y in yoy_growth) / len(yoy_growth) if yoy_growth else 3.0
    projections = []
    last_val = total_current
    for yr in range(2026, 2031):
        last_val = round(last_val * (1 + avg_growth_rate / 100))
        projections.append({"year": str(yr), "projected": last_val})

    trend_data = [{"year": y, "actual": v, "projected": None} for y, v in yearly_totals.items()]
    trend_data += [{"year": p["year"], "actual": None, "projected": p["projected"]} for p in projections]

    peak_periods = [
        {"period": "Jul-Aug", "reason": "Monsoon season – increased infections"},
        {"period": "Dec-Jan", "reason": "Winter respiratory surge"},
    ]

    seasonal_trends = [
        {"quarter": "Q1", "avg_kg": round(sum(current_year_monthly[0:3]) / 3)},
        {"quarter": "Q2", "avg_kg": round(sum(current_year_monthly[3:6]) / 3)},
        {"quarter": "Q3", "avg_kg": round(sum(current_year_monthly[6:9]) / 3)},
        {"quarter": "Q4", "avg_kg": round(sum(current_year_monthly[9:12]) / 3)},
    ]

    # --- SECTION 3: Waste Composition ---
    composition = [
        {"category": "General (Non-hazardous)", "percentage": 58.2, "kg": round(total_current * 0.582)},
        {"category": "Infectious", "percentage": 19.5, "kg": round(total_current * 0.195)},
        {"category": "Sharps", "percentage": 7.8, "kg": round(total_current * 0.078)},
        {"category": "Pathological", "percentage": 5.3, "kg": round(total_current * 0.053)},
        {"category": "Pharmaceutical", "percentage": 4.7, "kg": round(total_current * 0.047)},
        {"category": "Chemical", "percentage": 3.2, "kg": round(total_current * 0.032)},
        {"category": "Radioactive", "percentage": 1.3, "kg": round(total_current * 0.013)},
    ]
    hazardous_pct = round(100 - 58.2, 1)
    who_benchmark = 15.0
    deviation = round(hazardous_pct - who_benchmark, 1)

    # --- SECTION 4: Financial Impact ---
    cost_per_kg_general = 12.0
    cost_per_kg_hazardous = 45.0
    general_kg = round(total_current * 0.582)
    hazardous_kg = total_current - general_kg
    total_cost_general = round(general_kg * cost_per_kg_general)
    total_cost_hazardous = round(hazardous_kg * cost_per_kg_hazardous)
    total_disposal_cost = total_cost_general + total_cost_hazardous
    avg_cost_per_kg = round(total_disposal_cost / total_current, 2)
    cost_difference = round(cost_per_kg_hazardous - cost_per_kg_general, 2)

    cost_monthly = []
    for i, m in enumerate(months):
        gen = round(current_year_monthly[i] * 0.582)
        haz = current_year_monthly[i] - gen
        cost_monthly.append({
            "month": m,
            "general_cost": round(gen * cost_per_kg_general),
            "hazardous_cost": round(haz * cost_per_kg_hazardous),
            "total": round(gen * cost_per_kg_general + haz * cost_per_kg_hazardous),
        })

    # --- SECTION 5: Environmental Impact ---
    pct_incinerated = 42.5
    pct_autoclaved = 31.2
    pct_recycled = 18.8
    pct_landfill = 7.5
    co2_per_kg_incinerated = 1.2
    co2_total = round(total_current * (pct_incinerated / 100) * co2_per_kg_incinerated, 1)
    sustainable_pct = round(pct_autoclaved + pct_recycled, 1)

    treatment_distribution = [
        {"method": "Incineration", "percentage": pct_incinerated},
        {"method": "Autoclave", "percentage": pct_autoclaved},
        {"method": "Recycling", "percentage": pct_recycled},
        {"method": "Landfill", "percentage": pct_landfill},
    ]

    co2_monthly = []
    for i, m in enumerate(months):
        co2_monthly.append({
            "month": m,
            "emissions": round(current_year_monthly[i] * (pct_incinerated / 100) * co2_per_kg_incinerated, 1),
        })

    return {
        "period": period,
        "generated_at": datetime.now().isoformat(),
        "waste_generation": {
            "monthly_data": monthly_data,
            "total_current_year": total_current,
            "total_previous_year": total_prev,
            "yearly_growth_pct": yearly_growth,
            "waste_per_bed_day": waste_per_bed_day,
            "total_beds": beds,
        },
        "growth_trends": {
            "mom_growth": mom_growth,
            "yoy_growth": yoy_growth,
            "yearly_totals": yearly_totals,
            "trend_data": trend_data,
            "projections": projections,
            "peak_periods": peak_periods,
            "seasonal_trends": seasonal_trends,
            "avg_growth_rate": round(avg_growth_rate, 1),
        },
        "composition": {
            "breakdown": composition,
            "hazardous_pct": hazardous_pct,
            "who_benchmark": who_benchmark,
            "deviation_from_benchmark": deviation,
        },
        "financial": {
            "total_disposal_cost": total_disposal_cost,
            "total_cost_general": total_cost_general,
            "total_cost_hazardous": total_cost_hazardous,
            "cost_per_kg_avg": avg_cost_per_kg,
            "cost_per_kg_general": cost_per_kg_general,
            "cost_per_kg_hazardous": cost_per_kg_hazardous,
            "cost_difference": cost_difference,
            "monthly_costs": cost_monthly,
        },
        "environmental": {
            "pct_incinerated": pct_incinerated,
            "co2_emissions_kg": co2_total,
            "sustainable_treatment_pct": sustainable_pct,
            "treatment_distribution": treatment_distribution,
            "co2_monthly": co2_monthly,
        },
    }


@app.get("/api/reports")
async def get_reports(period: str = Query("monthly", enum=["monthly", "quarterly", "yearly"])):
    try:
        db = get_db()
        if db is None:
            return generate_reports_data(period)  # Fallback to static if no DB

        doc = await db.reports_statistics.find_one({"period": "base"})
        if not doc:
            # Seed base data
            base_data = generate_reports_data(period)
            base_data["period"] = "base"
            await db.reports_statistics.insert_one(base_data)
            doc = base_data
        
        # Calculate dynamic additions from today's scans to make stats "real"
        # For an MVP, we just add the scan counts to the base numbers
        scan_count = await db.scans.count_documents({})
        if scan_count > 0:
            doc["waste_generation"]["total_current_year"] += scan_count * 2  # Approx 2kg per item
            doc["composition"]["breakdown"][0]["kg"] += scan_count * 1.5
            
        doc["_id"] = str(doc.get("_id", ""))
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bins")
async def get_bins():
    db = get_db()
    if db is None:
        return []
    cursor = db.bins.find({})
    bins = []
    async for b in cursor:
        b["_id"] = str(b["_id"])
        if "lastCollected" in b and isinstance(b["lastCollected"], datetime):
            b["lastCollected"] = b["lastCollected"].strftime("%Ih ago")
        bins.append(b)
    return bins

class BinCreate(BaseModel):
    floor: int
    roomId: str

class WorkLogCreate(BaseModel):
    staff_email: str = ""
    staff_name: str = ""
    action: str  # "bin_collected" | "waste_disposed" | "noted"
    note: str = ""

@app.post("/api/bins")
async def create_bin(binReq: BinCreate):
    db = get_db()
    prefix = f"F{binReq.floor}"
    # auto name as per sequence
    count = await db.bins.count_documents({"floor": binReq.floor})
    new_id = f"{prefix}{count + 1}"
    
    doc = {
        "id": new_id, 
        "floor": binReq.floor, 
        "roomId": binReq.roomId,
        "compartments": { "Infectious": 0, "Sharps": 0, "General": 0, "Chemical": 0 },
        "worker": "Unassigned", 
        "workerRole": "Pending Assignment",
        "lastCollected": datetime.now(timezone.utc),
        "collections": 0,
        "status": "Active",
        "overallFill": 0
    }
    await db.bins.insert_one(doc)
    
    await distribute_bins(binReq.floor, db)
    
    doc["_id"] = str(doc["_id"])
    return doc

@app.delete("/api/bins/{bin_id}")
async def delete_bin(bin_id: str):
    db = get_db()
    bin_doc = await db.bins.find_one({"id": bin_id})
    if bin_doc:
        await db.bins.delete_one({"id": bin_id})
        await distribute_bins(bin_doc["floor"], db)
    return {"success": True}

class BinUpdate(BaseModel):
    worker: str

@app.put("/api/bins/{bin_id}")
async def update_bin(bin_id: str, binUpdate: BinUpdate):
    db = get_db()
    staff = await db.staff.find_one({"name": binUpdate.worker})
    role = staff["role"] if staff else "Pending Assignment"
    await db.bins.update_one(
        {"id": bin_id},
        {"$set": {"worker": binUpdate.worker, "workerRole": role}}
    )
    return {"success": True}

@app.post("/api/bins/{bin_id}/collect")
async def log_bin_activity(bin_id: str, req: WorkLogCreate):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=503, detail="Database not connected")
    
    # Update bin status in bins collection
    new_status = "Collected" if req.action == "bin_collected" else "Disposed" if req.action == "waste_disposed" else "Active"
    await db.bins.update_one(
        {"id": bin_id},
        {"$set": {"status": new_status, "lastCollected": datetime.now(timezone.utc), "overallFill": 0} if req.action == "bin_collected" else {"status": new_status}}
    )
    
    # Record work log
    log_doc = {
        "bin_id": bin_id,
        "staff_email": req.staff_email,
        "staff_name": req.staff_name,
        "action": req.action,
        "note": req.note or "",
        "timestamp": datetime.now(timezone.utc)
    }
    await db.work_log.insert_one(log_doc)
    log_doc["_id"] = str(log_doc["_id"])
    return {"success": True, "log": log_doc}

@app.get("/api/work_log")
async def get_work_log(limit: int = 50):
    db = get_db()
    if db is None:
        return []
    cursor = db.work_log.find({}, sort=[("timestamp", -1)]).limit(limit)
    logs = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        if isinstance(doc.get("timestamp"), datetime):
            doc["timestamp"] = doc["timestamp"].isoformat()
        logs.append(doc)
    return logs

@app.get("/api/staff")
async def get_staff():
    db = get_db()
    cursor = db.staff.find({})
    staff = []
    async for s in cursor:
        s["_id"] = str(s["_id"])
        staff.append(s)
    return staff

async def distribute_bins(floor: int, db):
    staff_cursor = db.staff.find({"floor": floor})
    staff_list = []
    async for s in staff_cursor:
        staff_list.append(s)
        
    if not staff_list:
        await db.bins.update_many({"floor": floor}, {"$set": {"worker": "Unassigned", "workerRole": "Pending Assignment"}})
        return

    bins_cursor = db.bins.find({"floor": floor})
    bins_list = []
    async for b in bins_cursor:
        bins_list.append(b)
        
    if not bins_list:
        return
        
    for i, b in enumerate(bins_list):
        assigned_staff = staff_list[i % len(staff_list)]
        await db.bins.update_one(
            {"_id": b["_id"]},
            {"$set": {"worker": assigned_staff["name"], "workerRole": assigned_staff["role"]}}
        )

class StaffCreate(BaseModel):
    name: str
    ward: str
    floor: int
    role: str

@app.post("/api/staff")
async def create_staff(staffReq: StaffCreate):
    db = get_db()
    highest = await db.staff.find_one({}, sort=[("rank", -1)])
    next_rank = (highest.get("rank", 0) + 1) if highest else 1
    new_staff = {
        "name": staffReq.name,
        "ward": staffReq.ward,
        "floor": staffReq.floor,
        "role": staffReq.role,
        "accuracy": 100.0,
        "items": 0,
        "rank": next_rank
    }
    await db.staff.insert_one(new_staff)
    await distribute_bins(staffReq.floor, db)
    return {"success": True}

class StaffUpdate(BaseModel):
    floor: int
    role: str
    name: str | None = None
    ward: str | None = None

@app.put("/api/staff/{staff_name}")
async def update_staff(staff_name: str, updateReq: StaffUpdate):
    db = get_db()
    
    old_staff = await db.staff.find_one({"name": staff_name})
    old_floor = old_staff.get("floor") if old_staff else None
    
    new_name = updateReq.name if updateReq.name else staff_name
    update_data = {"floor": updateReq.floor, "role": updateReq.role}
    if updateReq.name:
        update_data["name"] = updateReq.name
    if updateReq.ward:
        update_data["ward"] = updateReq.ward
        
    # Update the staff's detail
    await db.staff.update_one(
        {"name": staff_name},
        {"$set": update_data}
    )
    
    # Repartition bins
    if old_floor is not None and old_floor != updateReq.floor:
        await distribute_bins(old_floor, db)
    await distribute_bins(updateReq.floor, db)
    
    return {"success": True}

@app.delete("/api/staff/{staff_name}")
async def delete_staff(staff_name: str):
    db = get_db()
    old_staff = await db.staff.find_one({"name": staff_name})
    if not old_staff:
        return {"success": False, "error": "Staff not found"}
    floor = old_staff.get("floor")
    
    await db.staff.delete_one({"name": staff_name})
    
    if floor is not None:
        await distribute_bins(floor, db)
    return {"success": True}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
