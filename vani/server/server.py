from flask import Flask, request, jsonify
from flask_cors import CORS
from googletrans import Translator
import numpy as np
import joblib
import gTTS
import base64
import io

app = Flask(__name__)
CORS(app)

model = joblib.load("isl_model.pkl")
translator = Translator()

def normalize_landmarks(landmark_list):
    landmarks = np.array(landmark_list).reshape(-1, 3)
    origin = landmarks[0]
    normalized = landmarks - origin
    max_value = np.max(np.abs(normalized))
    if max_value > 0:
        normalized /= max_value
    return normalized.flatten()

# Natural Language Processing sentence formation cache
word_buffer = []

@app.route('/predict_gesture', methods=['POST'])
def predict_gesture():
    data = request.json
    raw_landmarks = data.get('landmarks')
    
    if not raw_landmarks:
        return jsonify({'error': 'No landmark data provided'}), 400

    features = normalize_landmarks(raw_landmarks).reshape(1, -1)
    prediction = model.predict(features)[0]
    probabilities = model.predict_proba(features)
    confidence = float(np.max(probabilities))

    # Reject ambiguous predictions (Fixes 'Hi' vs 'Good' issue)
    if confidence < 0.75:
        return jsonify({'prediction': 'Detecting...', 'confidence': confidence})

    return jsonify({'prediction': str(prediction), 'confidence': confidence})

@app.route('/translate_text', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get('text', '')
    target_lang = data.get('target_lang', 'hi') # 'hi', 'mr', or 'en'
    
    translated = translator.translate(text, dest=target_lang).text
    
    return jsonify({
        'original_text': text,
        'translated_text': translated,
        'target_lang': target_lang
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)