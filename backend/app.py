import os
import math
import random
import warnings
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from mediwaste_inference_7364 import MediWaste7364Engine

# Suppress warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

app = FastAPI(title="MediWaste AI Scanner Engine")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
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


@app.on_event("startup")
async def startup_event():
    load_engine()


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
        data = generate_reports_data(period)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
