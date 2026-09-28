import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score
import joblib

def normalize_landmarks(landmark_list):
    """
    Transforms raw landmarks into scale-invariant and origin-invariant vectors.
    """
    landmarks = np.array(landmark_list).reshape(-1, 3)
    # Origin centered at Wrist (Index 0)
    origin = landmarks[0]
    normalized = landmarks - origin
    
    # Scale invariant normalization using max distance
    max_value = np.max(np.abs(normalized))
    if max_value > 0:
        normalized /= max_value
        
    return normalized.flatten()

def train_isl_model(dataset_csv_path, output_model_path="isl_model.pkl"):
    df = pd.read_csv(dataset_csv_path)
    X = df.drop(columns=['label']).values
    y = df['label'].values

    # Preprocess all rows
    X_norm = np.array([normalize_landmarks(row) for row in X])

    X_train, X_test, y_train, y_test = train_test_split(X_norm, y, test_size=0.2, random_state=42)

    # Multi-Layer Perceptron for fast latency (<5ms inference)
    model = MLPClassifier(hidden_layer_sizes=(128, 64), max_iter=500, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    print(f"Model Training Accuracy: {accuracy_score(y_test, preds) * 100:.2f}%")

    joblib.dump(model, output_model_path)
    print(f"Model saved to {output_model_path}")

if __name__ == "__main__":
    train_isl_model("isl_landmarks_data.csv")