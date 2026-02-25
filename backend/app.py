import os
import warnings
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
