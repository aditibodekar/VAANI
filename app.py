import os
from collections import Counter, deque

import cv2
import joblib
import mediapipe as mp
import numpy as np
from flask import Flask, render_template, request, jsonify, send_file
from tensorflow.keras.models import load_model

from translation.translator import get_text
from translation.tts import synthesize


# ============================================================
# VAANI - Flask Backend
# Uses the same 132-feature + 30-frame LSTM pipeline
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(__name__)


# ============================================================
# MODEL PATHS
# ============================================================

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "lstm_gesture_model.keras"
)

SCALER_PATH = os.path.join(
    BASE_DIR,
    "models",
    "lstm_scaler.pkl"
)

ENCODER_PATH = os.path.join(
    BASE_DIR,
    "models",
    "lstm_label_encoder.pkl"
)


# ============================================================
# RECOGNITION SETTINGS
# These match predict_webcam_lstm.py
# ============================================================

SEQUENCE_LENGTH = 30
EXPECTED_FEATURES = 132

MAX_NUM_HANDS = 2

MIN_DETECTION_CONFIDENCE = 0.5
MIN_TRACKING_CONFIDENCE = 0.5

SMOOTHING_LENGTH = 7
MIN_STABLE_COUNT = 4

CONFIDENCE_THRESHOLD = 0.0


# ============================================================
# LOAD MODEL / SCALER / ENCODER
# ============================================================

print("Loading VAANI LSTM model...")

model = load_model(MODEL_PATH)

scaler = joblib.load(
    SCALER_PATH
)

label_encoder = joblib.load(
    ENCODER_PATH
)

print("Model loaded successfully.")
print("Expected input:", model.input_shape)
print("Classes:", list(label_encoder.classes_))


# ============================================================
# MEDIAPIPE
# ============================================================

mp_hands = mp.solutions.hands

hands_detector = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=MAX_NUM_HANDS,
    min_detection_confidence=MIN_DETECTION_CONFIDENCE,
    min_tracking_confidence=MIN_TRACKING_CONFIDENCE
)


# ============================================================
# RECOGNITION STATE
# ============================================================

sequence_buffer = deque(
    maxlen=SEQUENCE_LENGTH
)

prediction_history = deque(
    maxlen=SMOOTHING_LENGTH
)

current_gesture = ""
current_confidence = 0.0


# ============================================================
# FEATURE EXTRACTION
# ============================================================

def extract_features(results):
    """
    Creates exactly 132 features.

    Left hand:
        63 normalized landmark values
        3 absolute wrist coordinates

    Right hand:
        63 normalized landmark values
        3 absolute wrist coordinates

    Total:
        132
    """

    left_hand = np.zeros(
        66,
        dtype=np.float32
    )

    right_hand = np.zeros(
        66,
        dtype=np.float32
    )

    if not results.multi_hand_landmarks:
        return np.concatenate(
            [
                left_hand,
                right_hand
            ]
        )

    detected_hands = []

    for i, hand_landmarks in enumerate(
        results.multi_hand_landmarks
    ):

        landmarks = np.array(
            [
                [
                    lm.x,
                    lm.y,
                    lm.z
                ]
                for lm in hand_landmarks.landmark
            ],
            dtype=np.float32
        )

        # ----------------------------------------------------
        # Determine handedness
        # ----------------------------------------------------

        handedness = None

        if (
            results.multi_handedness
            and i < len(results.multi_handedness)
        ):

            handedness = (
                results
                .multi_handedness[i]
                .classification[0]
                .label
            )

        wrist = landmarks[0].copy()

        # ----------------------------------------------------
        # Wrist-origin normalization
        # ----------------------------------------------------

        normalized = landmarks - wrist

        # 21 x 3 = 63
        normalized_flat = normalized.flatten()

        # Absolute wrist = 3
        wrist_absolute = wrist

        hand_features = np.concatenate(
            [
                normalized_flat,
                wrist_absolute
            ]
        )

        detected_hands.append(
            (
                handedness,
                wrist[0],
                hand_features
            )
        )

    # --------------------------------------------------------
    # Assign hands
    #
    # Normally MediaPipe gives Left / Right.
    #
    # If both are reported with the same handedness,
    # fall back to wrist x-position.
    # --------------------------------------------------------

    assigned_left = None
    assigned_right = None

    for (
        handedness,
        wrist_x,
        features
    ) in detected_hands:

        if (
            handedness == "Left"
            and assigned_left is None
        ):

            assigned_left = features

        elif (
            handedness == "Right"
            and assigned_right is None
        ):

            assigned_right = features

    # --------------------------------------------------------
    # Fallback for one detected hand
    # --------------------------------------------------------

    if len(detected_hands) == 1:

        handedness, _, features = detected_hands[0]

        if handedness == "Left":

            assigned_left = features

        elif handedness == "Right":

            assigned_right = features

        else:

            # Unknown single hand
            assigned_right = features

    # --------------------------------------------------------
    # Fallback for two or more detected hands
    # --------------------------------------------------------

    elif len(detected_hands) >= 2:

        # If normal handedness assignment did not give
        # us both hands, sort by wrist x-position.

        if (
            assigned_left is None
            or assigned_right is None
        ):

            sorted_hands = sorted(
                detected_hands,
                key=lambda item: item[1]
            )

            assigned_left = sorted_hands[0][2]
            assigned_right = sorted_hands[1][2]

    # --------------------------------------------------------
    # Put assigned features into final arrays
    # --------------------------------------------------------

    if assigned_left is not None:
        left_hand = assigned_left

    if assigned_right is not None:
        right_hand = assigned_right

    # --------------------------------------------------------
    # Final 132-feature vector
    # --------------------------------------------------------

    features = np.concatenate(
        [
            left_hand,
            right_hand
        ]
    ).astype(np.float32)

    return features


# ============================================================
# LANDMARK DATA FOR FRONTEND
# ============================================================

def get_landmarks_for_ui(results):
    """
    Converts MediaPipe landmarks into normalized coordinates
    for drawing on the browser canvas.
    """

    hands_data = []

    if not results.multi_hand_landmarks:
        return hands_data

    for i, hand_landmarks in enumerate(
        results.multi_hand_landmarks
    ):

        points = []

        for lm in hand_landmarks.landmark:

            points.append(
                {
                    "x": float(lm.x),
                    "y": float(lm.y),
                    "z": float(lm.z)
                }
            )

        handedness = "Unknown"

        if (
            results.multi_handedness
            and i < len(results.multi_handedness)
        ):

            handedness = (
                results
                .multi_handedness[i]
                .classification[0]
                .label
            )

        hands_data.append(
            {
                "handedness": handedness,
                "landmarks": points
            }
        )

    return hands_data


# ============================================================
# RESET RECOGNITION
# ============================================================

def reset_recognition():

    global current_gesture
    global current_confidence

    sequence_buffer.clear()
    prediction_history.clear()

    current_gesture = ""
    current_confidence = 0.0


# ============================================================
# PROCESS FRAME
# ============================================================

def process_frame(frame):

    global current_gesture
    global current_confidence

    # --------------------------------------------------------
    # BGR -> RGB
    # --------------------------------------------------------

    rgb_frame = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    results = hands_detector.process(
        rgb_frame
    )

    # --------------------------------------------------------
    # Count detected hands
    # --------------------------------------------------------

    hands_count = (
        len(results.multi_hand_landmarks)
        if results.multi_hand_landmarks
        else 0
    )

    # --------------------------------------------------------
    # Get landmarks for browser
    # --------------------------------------------------------

    landmarks = get_landmarks_for_ui(
        results
    )

    # --------------------------------------------------------
    # NO HAND
    #
    # Clear old sequence so stale gestures are not predicted.
    # --------------------------------------------------------

    if hands_count == 0:

        reset_recognition()

        return {
            "gesture": "",
            "confidence": 0.0,
            "hands": 0,
            "landmarks": [],
            "status": "waiting",
            "frames_collected": 0,
            "sequence_length": SEQUENCE_LENGTH
        }

    # --------------------------------------------------------
    # Extract exactly 132 features
    # --------------------------------------------------------

    features = extract_features(
        results
    )

    if features.shape[0] != EXPECTED_FEATURES:

        reset_recognition()

        return {
            "gesture": "",
            "confidence": 0.0,
            "hands": hands_count,
            "landmarks": landmarks,
            "status": "error",
            "frames_collected": 0,
            "sequence_length": SEQUENCE_LENGTH,
            "message": (
                f"Feature mismatch: "
                f"{features.shape[0]} instead of "
                f"{EXPECTED_FEATURES}"
            )
        }

    # --------------------------------------------------------
    # Add frame to sequence
    # --------------------------------------------------------

    sequence_buffer.append(
        features
    )

    frames_collected = len(
        sequence_buffer
    )

    # --------------------------------------------------------
    # Not enough frames yet
    # --------------------------------------------------------

    if frames_collected < SEQUENCE_LENGTH:

        current_gesture = ""
        current_confidence = 0.0

        return {
            "gesture": "",
            "confidence": 0.0,
            "hands": hands_count,
            "landmarks": landmarks,
            "status": "collecting",
            "frames_collected": frames_collected,
            "sequence_length": SEQUENCE_LENGTH
        }

    # --------------------------------------------------------
    # We now have 30 frames
    # --------------------------------------------------------

    sequence = np.array(
        sequence_buffer,
        dtype=np.float32
    )

    # Shape:
    # (30, 132)

    # --------------------------------------------------------
    # Scaler was fitted on individual 132-feature vectors,
    # so reshape before scaling.
    # --------------------------------------------------------

    original_shape = sequence.shape

    sequence_2d = sequence.reshape(
        -1,
        EXPECTED_FEATURES
    )

    sequence_scaled = scaler.transform(
        sequence_2d
    )

    sequence_scaled = sequence_scaled.reshape(
        original_shape
    )

    # --------------------------------------------------------
    # Add batch dimension
    #
    # Final shape:
    # (1, 30, 132)
    # --------------------------------------------------------

    model_input = np.expand_dims(
        sequence_scaled,
        axis=0
    )

    # --------------------------------------------------------
    # LSTM prediction
    # --------------------------------------------------------

    prediction = model.predict(
        model_input,
        verbose=0
    )[0]

    predicted_index = int(
        np.argmax(prediction)
    )

    confidence = float(
        prediction[predicted_index]
    )

    predicted_gesture = (
        label_encoder.inverse_transform(
            [predicted_index]
        )[0]
    )

    # --------------------------------------------------------
    # Confidence threshold
    # --------------------------------------------------------

    if confidence < CONFIDENCE_THRESHOLD:

        prediction_history.clear()

        current_gesture = ""
        current_confidence = confidence

        return {
            "gesture": "",
            "confidence": confidence,
            "hands": hands_count,
            "landmarks": landmarks,
            "status": "recognizing",
            "frames_collected": SEQUENCE_LENGTH,
            "sequence_length": SEQUENCE_LENGTH
        }

    # --------------------------------------------------------
    # Smoothing
    # --------------------------------------------------------

    prediction_history.append(
        predicted_gesture
    )

    counts = Counter(
        prediction_history
    )

    stable_gesture, stable_count = (
        counts.most_common(1)[0]
    )

    # --------------------------------------------------------
    # Require stable prediction
    # --------------------------------------------------------

    if stable_count >= MIN_STABLE_COUNT:

        current_gesture = stable_gesture
        current_confidence = confidence

        return {
            "gesture": current_gesture,
            "confidence": current_confidence,
            "hands": hands_count,
            "landmarks": landmarks,
            "status": "recognized",
            "frames_collected": SEQUENCE_LENGTH,
            "sequence_length": SEQUENCE_LENGTH
        }

    # --------------------------------------------------------
    # Still stabilizing
    # --------------------------------------------------------

    return {
        "gesture": "",
        "confidence": confidence,
        "hands": hands_count,
        "landmarks": landmarks,
        "status": "recognizing",
        "frames_collected": SEQUENCE_LENGTH,
        "sequence_length": SEQUENCE_LENGTH
    }


# ============================================================
# PAGE ROUTES
# ============================================================

@app.route("/")
def home():

    return render_template(
        "index.html"
    )


@app.route("/translate")
def translate_page():

    return render_template(
        "translate.html"
    )


@app.route("/how-it-works")
def how_it_works():

    return render_template(
        "how_it_works.html"
    )


@app.route("/about")
def about():

    return render_template(
        "about.html"
    )


@app.route("/login")
def login():

    return render_template(
        "login.html"
    )


# ============================================================
# PREDICTION API
# ============================================================

@app.route(
    "/predict",
    methods=["POST"]
)
def predict():

    if "frame" not in request.files:

        return jsonify(
            {
                "error": "No frame received."
            }
        ), 400

    file = request.files["frame"]

    if file.filename == "":

        return jsonify(
            {
                "error": "Empty frame."
            }
        ), 400

    try:

        file_bytes = np.frombuffer(
            file.read(),
            np.uint8
        )

        frame = cv2.imdecode(
            file_bytes,
            cv2.IMREAD_COLOR
        )

        if frame is None:

            return jsonify(
                {
                    "error": "Could not decode frame."
                }
            ), 400

        result = process_frame(
            frame
        )

        return jsonify(
            result
        )

    except Exception as exc:

        print(
            "Prediction error:",
            exc
        )

        return jsonify(
            {
                "error": str(exc)
            }
        ), 500


# ============================================================
# RESET API
# ============================================================

@app.route(
    "/reset",
    methods=["POST"]
)
def reset():

    reset_recognition()

    return jsonify(
        {
            "success": True
        }
    )


# ============================================================
# TRANSLATION API
# ============================================================

@app.route(
    "/translation",
    methods=["POST"]
)
def translation():

    data = request.get_json(
        silent=True
    ) or {}

    gesture = data.get(
        "gesture",
        ""
    )

    language = data.get(
        "language",
        "English"
    )

    if not gesture:

        return jsonify(
            {
                "translation": ""
            }
        )

    try:

        translated = get_text(
            gesture,
            language
        )

        return jsonify(
            {
                "translation": translated
            }
        )

    except Exception as exc:

        print(
            "Translation error:",
            exc
        )

        return jsonify(
            {
                "translation": gesture,
                "error": str(exc)
            }
        )


# ============================================================
# TEXT-TO-SPEECH API
# ============================================================

@app.route(
    "/speak",
    methods=["POST"]
)
def speak():

    try:

        data = request.get_json(
            silent=True
        ) or {}

        text = str(
            data.get(
                "text",
                ""
            )
        ).strip()

        language = str(
            data.get(
                "language",
                ""
            )
        ).strip()

        # ----------------------------------------------------
        # Validate text
        # ----------------------------------------------------

        if not text:

            return jsonify(
                {
                    "success": False,
                    "error": "No text provided."
                }
            ), 400

        # ----------------------------------------------------
        # Validate language
        # ----------------------------------------------------

        if language not in {
            "English",
            "Hindi",
            "Marathi"
        }:

            return jsonify(
                {
                    "success": False,
                    "error": "Unsupported language."
                }
            ), 400

        # ----------------------------------------------------
        # Generate / retrieve cached speech
        # ----------------------------------------------------

        audio_path = synthesize(
            text,
            language
        )

        # ----------------------------------------------------
        # Return MP3
        # ----------------------------------------------------

        return send_file(
            audio_path,
            mimetype="audio/mpeg",
            as_attachment=False
        )

    except Exception as exc:

        print(
            "TTS error:",
            exc
        )

        return jsonify(
            {
                "success": False,
                "error": "Speech generation failed."
            }
        ), 500


# ============================================================
# START SERVER
# ============================================================

# ============================================================
# NLP SENTENCE SYNTHESIS API (AI Studio Feature)
# ============================================================

@app.route("/synthesize", methods=["POST"])
def synthesize_sentence():
    data = request.get_json(silent=True) or {}
    tokens = data.get("tokens", [])
    
    if not tokens:
        return jsonify({"english": "", "hindi": "", "marathi": ""}), 400

    # Clean raw tokens into standard sentence structure
    words = [t.capitalize() for t in tokens]
    english_text = " ".join(words) + "."

    # Translate using existing translation utility
    try:
        hindi_text = get_text(english_text, "Hindi")
        marathi_text = get_text(english_text, "Marathi")
    except Exception:
        hindi_text = english_text
        marathi_text = english_text

    return jsonify({
        "english": english_text,
        "hindi": hindi_text,
        "marathi": marathi_text,
        "source": "server"
    })
    
    # ============================================================
# ADMIN MODEL TRAINING API
# Stores 30-frame sequences into sequence_dataset/ & Retrains
# ============================================================

@app.route("/admin/train-sequence", methods=["POST"])
def admin_train_sequence():
    data = request.get_json(silent=True) or {}
    sign_name = data.get("sign_name", "").strip().replace(" ", "_").lower()
    sequence_data = data.get("sequence", []) # Array of 30 frames x 132 features

    if not sign_name or len(sequence_data) < SEQUENCE_LENGTH:
        return jsonify({"success": False, "error": "Invalid sequence data."}), 400

    try:
        # Save sequence .npy file directly into target dataset folder
        gesture_dir = os.path.join(BASE_DIR, "sequence_dataset", sign_name)
        os.makedirs(gesture_dir, exist_ok=True)
        
        sequence_filename = f"{sign_name}_{int(time.time())}.npy"
        np.save(os.path.join(gesture_dir, sequence_filename), np.array(sequence_data, dtype=np.float32))

        return jsonify({
            "success": True,
            "message": f"Saved sequence for {sign_name}.",
            "file": sequence_filename
        })

    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500
    
    # app.py translation route
@app.route("/translation", methods=["POST"])
def translation():
    data = request.get_json(silent=True) or {}
    gesture = data.get("gesture", "")
    language = data.get("language", "English")

    translated = get_text(gesture, language)  # Passes language directly to NLP engine
    return jsonify({"translation": translated})

if __name__ == "__main__":

    print()
    print("=" * 60)
    print(
        "VAANI - Sign Language Recognition System"
    )
    print("=" * 60)
    print(
        "Server: http://127.0.0.1:5000"
    )
    print(
        "Press CTRL+C to stop."
    )
    print("=" * 60)
    print()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False,
        threaded=True
    )