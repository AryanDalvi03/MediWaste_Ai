# MediWaste AI

MediWaste AI is a comprehensive solution designed for the classification and management of medical and general waste. It features a React-based frontend dashboard and a powerful FastAPI backend powered by a hybrid AI classification engine (EfficientNet + Random Forest) for accurate waste sorting.

## Features

- **AI Waste Classification**: Upload images of waste to get real-time classification and disposal bin recommendations (e.g., Red Sharps Bin, Yellow Biohazard Bin, Recycling, etc.).
- **Hazard Status Detection**: Automatically flags whether the identified waste is Hazardous or Non-Hazardous.
- **Reporting & Analytics**: Interactive dashboard showing waste generation trends, composition, financial impact, and environmental metrics (CO2 emissions, treatment distribution).
- **Modern UI**: Built with React, Vite, Tailwind CSS for a responsive and premium user experience.

## Tech Stack

### Frontend
- **Framework**: React, Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn-ui
- **Package Manager**: npm

### Backend
- **Framework**: FastAPI (Python)
- **AI/ML**: TensorFlow (EfficientNet), scikit-learn (Random Forest), XGBoost
- **Image Processing**: OpenCV, Pillow, scikit-image
- **Database**: MongoDB (via PyMongo)
- **Server**: Uvicorn
- **Inference Engine**: Custom Hybrid 7364-Dimension Pipeline (`mediwaste_inference_7364.py`)

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher) and npm
- [Python 3.8+](https://www.python.org/downloads/)
- Git

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/AryanDalvi03/MediWaste_Ai.git
cd MediWaste_Ai
```

### 2. Backend Setup

The backend handles the AI inference and reporting API.

```bash
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python app.py
# Or using uvicorn directly: uvicorn app:app --host 0.0.0.0 --port 8000
```
*The backend server will start at `http://localhost:8000`.*

>**Note:** Ensure that the required model files (`efficientnet_finetuned_model.keras`, `rf_finetuned_features_scaler1.joblib`, `rf_finetuned_features_classifier1.joblib`) are present in the `backend` directory for the AI engine to initialize successfully.

### 3. Frontend Setup

The frontend is a modern React application. Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install
# Or if using bun: bun install

# Start the development server
npm run dev
# Or if using bun: bun run dev
```
*The application will typically be available at `http://localhost:5173` or as specified in your terminal.*

## Usage

1. Start both the backend and frontend development servers.
2. Open the frontend address in your browser.
3. Navigate to the scanner to upload waste images and receive AI-driven disposal instructions.
4. View the dashboard for comprehensive reports on waste management metrics.

---

## Backend Architecture

### File Structure

```
backend/
├── app.py                                  # FastAPI application & API routes
├── mediwaste_inference_7364.py             # Hybrid AI inference engine
├── requirements.txt                        # Python dependencies
├── efficientnet_finetuned_model.keras.zip  # EfficientNet model (compressed)
├── rf_finetuned_features_classifier1.joblib # Random Forest classifier
├── rf_finetuned_features_scaler1.joblib    # Feature scaler
├── model.weights.h5                        # Model weights
├── config.json                             # Configuration
├── metadata.json                           # Model metadata
└── retrain_improved.py                     # Script for model retraining
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check – returns server status |
| `POST` | `/predict` | Upload a waste image for AI classification |
| `GET` | `/api/reports` | Retrieve waste management analytics & reports |

#### `POST /predict`

Accepts an image file upload and returns a classification result.

**Request:**
```bash
curl -X POST http://localhost:8000/predict \
  -F "file=@waste_image.jpg"
```

**Response:**
```json
{
  "class": "Syringe",
  "confidence": 94.32,
  "disposal_bin": "Red Sharps Bin",
  "hazard_status": "Hazardous",
  "timestamp": "07/03/2026, 11:30:00 PM",
  "raw_class_id": 10,
  "feature_dim": 7364
}
```

#### `GET /api/reports`

Returns comprehensive waste management analytics.

**Query Parameters:**
- `period` (optional): `monthly` | `quarterly` | `yearly` (default: `monthly`)

**Response includes:**
- **Waste Generation**: Monthly data, year-over-year comparison, waste per bed per day
- **Growth & Trends**: Month-over-month growth, yearly projections (2026–2030), seasonal trends, peak periods
- **Waste Composition**: Category breakdown (General, Infectious, Sharps, Pathological, Pharmaceutical, Chemical, Radioactive)
- **Financial Impact**: Disposal costs per category, monthly cost trends, cost per kg analysis
- **Environmental Impact**: CO₂ emissions, treatment distribution (Incineration, Autoclave, Recycling, Landfill)

### Hybrid AI Engine (7364-Dimension)

The core inference engine (`MediWaste7364Engine`) uses a **dual-path feature fusion** approach:

```
Input Image (224×224)
        │
        ├──► Path A: EfficientNet CNN ──► 1,280 neural features
        │
        └──► Path B: HOG Algorithm ─────► 6,084 geometric features
                                                │
                           Feature Fusion ◄─────┘
                           [1,280 + 6,084 = 7,364]
                                    │
                              StandardScaler
                                    │
                           Random Forest Classifier
                                    │
                              Prediction + Confidence
```

- **Path A (Neural):** EfficientNet extracts deep semantic features (1,280-d vector from `avg_pool` layer)
- **Path B (Geometric):** HOG (Histogram of Oriented Gradients) captures edge/shape features (6,084-d vector)
- **Fusion:** Both vectors are concatenated → scaled → classified by a Random Forest

### Waste Classification Categories

| Class | Disposal Bin | Hazard Status |
|-------|-------------|---------------|
| (ME) Metal | Recycling Bin (Blue) | Non-Hazardous |
| (OW) Organic | Organic Bin (Green) | Non-Hazardous |
| (PE) Plastic | Recycling Bin (Blue) | Non-Hazardous |
| (PP) Paper | Paper Bin (Blue) | Non-Hazardous |
| (SN) Needle | Red Sharps Bin | Hazardous |
| Body Tissue | Yellow Biohazard Bin | Hazardous |
| Gauze | Yellow Biohazard Bin | Hazardous |
| Glass | Red Sharps Bin | Hazardous |
| Gloves | Yellow Biohazard Bin | Hazardous |
| Mask | Yellow Biohazard Bin | Hazardous |
| Syringe | Red Sharps Bin | Hazardous |
| Tweezers | Red Sharps Bin | Hazardous |

### Backend Dependencies

```
fastapi              # Web framework
uvicorn              # ASGI server
python-multipart     # File upload support
tensorflow>=2.15.0   # EfficientNet model
scikit-learn         # Random Forest classifier & scaler
joblib               # Model serialization
numpy                # Numerical computing
pillow               # Image processing
opencv-python-headless  # Computer vision (HOG preprocessing)
scikit-image         # HOG feature extraction
xgboost              # Gradient boosting (alternative classifier)
```
