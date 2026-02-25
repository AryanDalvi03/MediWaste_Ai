"""
MediWaste AI — Enhanced Retraining Script
==========================================
This script retrains the EfficientNetV2 + classifier pipeline with:
  1. Training-time data augmentation
  2. Fine-tuning top EfficientNet layers
  3. XGBoost classifier (replaces Random Forest)
  4. Class balancing via class weights
  5. Consistent preprocess_input usage

USAGE:
  1. Place your dataset in: backend/dataset/
     Structure:
       dataset/
         (ME) Metal/
         (OW) Organic/
         (PE) Plastic/
         ...each folder contains images for that class

  2. Run: python retrain_improved.py

  3. New model files will be saved alongside existing ones with '_v2' suffix.
     Once validated, rename them to replace the originals.

REQUIREMENTS (install first):
  pip install tensorflow scikit-learn joblib numpy pillow xgboost
"""

import os
import sys
import warnings
import numpy as np
import tensorflow as tf
import joblib
from PIL import Image
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras.applications import EfficientNetV2B0
from tensorflow.keras.applications.efficientnet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

# ========================================
# CONFIGURATION
# ========================================
CURRENT_FOLDER = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(CURRENT_FOLDER, "dataset")
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
FINE_TUNE_EPOCHS = 30
FINE_TUNE_LAYERS = 20  # Number of top EfficientNet layers to unfreeze

CLASSES = [
    '(ME) Metal', '(OW) Organic', '(PE) Plastic', '(PP) Paper',
    '(SN) Needle', 'Body Tissue', 'Gauze', 'Glass',
    'Gloves', 'Mask', 'Syringe', 'Tweezers'
]

# Output paths (saved with _v2 suffix to avoid overwriting originals)
MODEL_OUT = os.path.join(CURRENT_FOLDER, "efficientnet_finetuned_model_v2.keras")
SCALER_OUT = os.path.join(CURRENT_FOLDER, "rf_finetuned_features_scaler_v2.joblib")
CLASSIFIER_OUT = os.path.join(CURRENT_FOLDER, "rf_finetuned_features_classifier_v2.joblib")


def load_dataset():
    """Load images from the dataset directory structure."""
    print("\n📂 Loading dataset...")

    if not os.path.exists(DATASET_DIR):
        print(f"ERROR: Dataset directory not found: {DATASET_DIR}")
        print("Please create the directory and add class subfolders with images.")
        sys.exit(1)

    images = []
    labels = []
    class_counts = {}

    # Build a mapping from folder names to class indices
    available_folders = sorted(os.listdir(DATASET_DIR))
    folder_to_idx = {}

    for folder in available_folders:
        folder_path = os.path.join(DATASET_DIR, folder)
        if not os.path.isdir(folder_path):
            continue

        # Match folder name to CLASSES
        matched_idx = None
        for idx, cls_name in enumerate(CLASSES):
            if folder.strip().lower() == cls_name.strip().lower():
                matched_idx = idx
                break

        if matched_idx is None:
            print(f"  ⚠ Skipping unrecognized folder: '{folder}'")
            continue

        folder_to_idx[folder] = matched_idx
        count = 0

        for img_file in os.listdir(folder_path):
            img_path = os.path.join(folder_path, img_file)
            try:
                img = Image.open(img_path).convert('RGB').resize(IMG_SIZE)
                img_array = np.array(img, dtype=np.float32)
                images.append(img_array)
                labels.append(matched_idx)
                count += 1
            except Exception:
                continue

        class_counts[CLASSES[matched_idx]] = count
        print(f"  ✓ {CLASSES[matched_idx]}: {count} images")

    if len(images) == 0:
        print("ERROR: No images loaded. Check your dataset directory structure.")
        sys.exit(1)

    X = np.array(images)
    y = np.array(labels)

    print(f"\n📊 Total images: {len(X)}")
    print(f"📊 Classes found: {len(class_counts)}")

    # Warn about class imbalance
    counts = list(class_counts.values())
    if max(counts) / max(min(counts), 1) > 3:
        print("⚠ WARNING: Significant class imbalance detected. Class weights will be applied.")

    return X, y


def create_augmented_data_generator():
    """Create ImageDataGenerator with training-time augmentation."""
    return ImageDataGenerator(
        rotation_range=30,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.15,
        zoom_range=0.2,
        horizontal_flip=True,
        vertical_flip=False,
        brightness_range=[0.8, 1.2],
        fill_mode='nearest',
        preprocessing_function=preprocess_input  # Consistent preprocessing
    )


def build_fine_tuned_model():
    """Build EfficientNetV2 with unfrozen top layers for fine-tuning."""
    print("\n🧠 Building fine-tuned EfficientNetV2...")

    base_model = EfficientNetV2B0(
        weights='imagenet',
        include_top=False,
        input_shape=(224, 224, 3)
    )

    # Freeze all layers first
    for layer in base_model.layers:
        layer.trainable = False

    # Unfreeze top N layers for fine-tuning
    for layer in base_model.layers[-FINE_TUNE_LAYERS:]:
        layer.trainable = True

    trainable_count = sum(1 for l in base_model.layers if l.trainable)
    frozen_count = sum(1 for l in base_model.layers if not l.trainable)
    print(f"  Frozen layers: {frozen_count}")
    print(f"  Trainable layers: {trainable_count}")

    # Build classification head
    x = base_model.output
    x = GlobalAveragePooling2D(name='avg_pool')(x)
    x = Dropout(0.3)(x)
    x = Dense(256, activation='relu')(x)
    x = Dropout(0.2)(x)
    predictions = Dense(len(CLASSES), activation='softmax')(x)

    model = Model(inputs=base_model.input, outputs=predictions)

    # Use a small learning rate for fine-tuning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )

    return model


def extract_features(model, X_data):
    """Extract features from the avg_pool layer for the classifier."""
    print("🔬 Extracting features...")

    feature_model = Model(
        inputs=model.input,
        outputs=model.get_layer('avg_pool').output
    )

    # Apply preprocessing
    X_processed = preprocess_input(X_data.copy())

    # Extract in batches to avoid memory issues
    features = feature_model.predict(X_processed, batch_size=BATCH_SIZE, verbose=1)
    print(f"  Feature shape: {features.shape}")
    return features


def train_xgboost_classifier(X_train, y_train, X_test, y_test, class_weights_dict):
    """Train XGBoost classifier on extracted features."""
    print("\n🌲 Training XGBoost classifier...")

    try:
        import xgboost as xgb

        # Convert class weights to sample weights
        sample_weights = np.array([class_weights_dict[label] for label in y_train])

        classifier = xgb.XGBClassifier(
            n_estimators=500,
            max_depth=8,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            use_label_encoder=False,
            eval_metric='mlogloss',
            n_jobs=-1,
            random_state=42
        )

        classifier.fit(
            X_train, y_train,
            sample_weight=sample_weights,
            eval_set=[(X_test, y_test)],
            verbose=True
        )

        return classifier

    except ImportError:
        print("⚠ XGBoost not installed. Falling back to Random Forest.")
        print("  Install with: pip install xgboost")
        from sklearn.ensemble import RandomForestClassifier

        classifier = RandomForestClassifier(
            n_estimators=500,
            max_depth=None,
            class_weight='balanced',
            n_jobs=-1,
            random_state=42
        )
        classifier.fit(X_train, y_train)
        return classifier


def main():
    print("=" * 60)
    print("  MediWaste AI — Enhanced Retraining Pipeline")
    print("=" * 60)

    # --- Step 1: Load Dataset ---
    X, y = load_dataset()

    # --- Step 2: Split Data ---
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n📊 Train: {len(X_train)} | Test: {len(X_test)}")

    # --- Step 3: Compute Class Weights ---
    unique_classes = np.unique(y)
    weights = compute_class_weight('balanced', classes=unique_classes, y=y_train)
    class_weights_dict = dict(zip(unique_classes, weights))
    print(f"⚖ Class weights: {class_weights_dict}")

    # --- Step 4: Build & Fine-Tune EfficientNet ---
    model = build_fine_tuned_model()

    # Data augmentation generator
    train_gen = create_augmented_data_generator()

    callbacks = [
        EarlyStopping(
            monitor='val_accuracy',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            verbose=1
        )
    ]

    print("\n🏋️ Fine-tuning EfficientNetV2...")
    model.fit(
        train_gen.flow(X_train, y_train, batch_size=BATCH_SIZE),
        epochs=FINE_TUNE_EPOCHS,
        validation_data=(preprocess_input(X_test.copy()), y_test),
        class_weight=class_weights_dict,
        callbacks=callbacks,
        verbose=1
    )

    # Evaluate end-to-end model
    val_loss, val_acc = model.evaluate(preprocess_input(X_test.copy()), y_test, verbose=0)
    print(f"\n📈 End-to-end validation accuracy: {val_acc * 100:.2f}%")

    # --- Step 5: Save the fine-tuned Keras model ---
    print(f"\n💾 Saving fine-tuned model to: {MODEL_OUT}")
    model.save(MODEL_OUT)

    # --- Step 6: Extract Features for Hybrid Pipeline ---
    print("\n🔬 Building hybrid pipeline (EfficientNet features → XGBoost)...")
    train_features = extract_features(model, X_train)
    test_features = extract_features(model, X_test)

    # --- Step 7: Scale Features ---
    scaler = StandardScaler()
    train_scaled = scaler.fit_transform(train_features)
    test_scaled = scaler.transform(test_features)

    # --- Step 8: Train XGBoost Classifier ---
    classifier = train_xgboost_classifier(
        train_scaled, y_train, test_scaled, y_test, class_weights_dict
    )

    # --- Step 9: Evaluate ---
    y_pred = classifier.predict(test_scaled)
    print("\n📊 Classification Report (Hybrid Pipeline):")
    print(classification_report(
        y_test, y_pred,
        target_names=[CLASSES[i] for i in sorted(np.unique(y))],
        digits=3
    ))

    # --- Step 10: Save Artifacts ---
    print(f"💾 Saving scaler to: {SCALER_OUT}")
    joblib.dump(scaler, SCALER_OUT)

    print(f"💾 Saving classifier to: {CLASSIFIER_OUT}")
    joblib.dump(classifier, CLASSIFIER_OUT)

    print("\n" + "=" * 60)
    print("  ✅ RETRAINING COMPLETE!")
    print("=" * 60)
    print(f"\nNew model files saved with '_v2' suffix:")
    print(f"  • {os.path.basename(MODEL_OUT)}")
    print(f"  • {os.path.basename(SCALER_OUT)}")
    print(f"  • {os.path.basename(CLASSIFIER_OUT)}")
    print(f"\nTo use them, rename to remove '_v2' (replace the originals).")
    print(f"Then restart the backend: python app.py")


if __name__ == "__main__":
    main()
