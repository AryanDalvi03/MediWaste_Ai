# MediWaste AI

MediWaste AI is a comprehensive solution designed for the classification and management of medical and general waste. It features a React-based frontend dashboard and a powerful FastAPI backend powered by a hybrid AI classification engine (EfficientNet + Random Forest) for accurate waste sorting.

## Features

- **AI Waste Classification**: Upload images of waste to get real-time classification and disposal bin recommendations (e.g., Red Sharps Bin, Yellow Biohazard Bin, Recycling, etc.).
- **Hazard Status Detection**: Automatically flags whether the identified waste is Hazardous or Non-Hazardous.
- **Reporting & Analytics**: Interactive dashboard showing waste generation trends, composition, financial impact, and environmental metrics (CO2 emissions, treatment distribution).
- **Modern UI**: Built with React, Vite, Tailwind CSS, and shadcn-ui for a responsive and premium user experience.

## Tech Stack

### Frontend
- **Framework**: React, Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn-ui
- **Package Manager**: npm / bun

### Backend
- **Framework**: FastAPI (Python)
- **AI/ML**: TensorFlow (EfficientNet), scikit-learn (Random Forest), XGBoost
- **Image Processing**: OpenCV, Pillow, scikit-image
- **Server**: Uvicorn

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
