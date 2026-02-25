# MediWaste AI: Unified 7,364-Dimension Inference Engine
# This script handles the "Glue Logic" between the .keras model and the HOG algorithm.

import os
import io
import joblib
import numpy as np
import tensorflow as tf
import cv2
from PIL import Image
from skimage.feature import hog

class MediWaste7364Engine:
    def __init__(self, keras_path, classifier_path, scaler_path):
        """
        Initializes the Hybrid Pipeline.
        keras_path: path to efficientnet_finetuned_model.keras (1280 features)
        classifier_path: path to your rf/xg classifier (expects 7364 features)
        scaler_path: path to your scaler1.joblib
        """
        print("--- Initializing 7364 Hybrid Engine ---")
        
        # 1. Load the Neural Path (1280)
        full_model = tf.keras.models.load_model(keras_path)
        self.feature_extractor = tf.keras.Model(
            inputs=full_model.input, 
            outputs=full_model.get_layer('avg_pool').output
        )
        
        # 2. Load the Classifier Path (Decision Brain)
        self.classifier = joblib.load(classifier_path)
        self.scaler = joblib.load(scaler_path)
        
        self.classes = [
            '(ME) Metal', '(OW) Organic', '(PE) Plastic', '(PP) Paper', 
            '(SN) Needle', 'Body Tissue', 'Gauze', 'Glass', 
            'Gloves', 'Mask', 'Syringe', 'Tweezers'
        ]
        print("[OK] Hybrid Pipeline Ready (Input: 224x224 -> Output: 7364 -> Prediction)")

    def get_features_7364(self, img_array):
        """
        The Core Logic: Merges Neural (1280) and Geometric (6084)
        """
        # PATH A: Neural Extraction (1280)
        neural_input = np.expand_dims(img_array, axis=0)
        f_neural = self.feature_extractor.predict(neural_input, verbose=0).flatten()

        # PATH B: Geometric Extraction (6084)
        # orientations=9, pixels_per_cell=(16,16), cells_per_block=(2,2) 
        # result in exactly 6084 features for a 224x224 image.
        gray_img = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        f_hog = hog(
            gray_img, orientations=9, pixels_per_cell=(16, 16),
            cells_per_block=(2, 2), transform_sqrt=True, block_norm='L2-Hys'
        )

        # FUSION: [1280] + [6084] = 7364
        return np.hstack([f_neural, f_hog]).reshape(1, -1)

    def predict(self, image_bytes):
        """
        Full inference from raw bytes to JSON result
        """
        # Pre-process
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB').resize((224, 224))
        img_array = np.array(img)

        # Extract 7364-dim vector
        f_hybrid = self.get_features_7364(img_array)

        # Scale and Classify
        f_scaled = self.scaler.transform(f_hybrid)
        pred_idx = self.classifier.predict(f_scaled)[0]
        conf = np.max(self.classifier.predict_proba(f_scaled)) * 100

        label = self.classes[pred_idx]
        return {
            "type": label,
            "confidence": round(float(conf), 2),
            "hazardous": label in ['(SN) Needle', 'Body Tissue', 'Gauze', 'Syringe'],
            "vector_dim": f_hybrid.shape[1]
        }

# --- EXAMPLE USAGE FOR YOUR MAIN.PY ---
# engine = MediWaste7364Engine('efficientnet_model.keras', 'classifier1.joblib', 'scaler1.joblib')
# result = engine.predict(file_bytes)