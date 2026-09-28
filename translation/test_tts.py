import os
from pathlib import Path

import requests
from dotenv import load_dotenv


# ---------------------------------------------------------
# VAANI - Gemini 3.1 Flash TTS via OpenRouter
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

# Load .env from VAANI root
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("OPENROUTER_API_KEY")

MODEL = "google/gemini-3.1-flash-tts-preview"
VOICE = "Zephyr"

OUTPUT_FILE = BASE_DIR / "translation" / "test_output.mp3"

URL = "https://openrouter.ai/api/v1/audio/speech"


def main():
    if not API_KEY:
        print("ERROR: OPENROUTER_API_KEY was not found.")
        print(f"Expected .env file at: {BASE_DIR / '.env'}")
        return

    text = "Hello. Welcome to VAANI. This is a text to speech test."

    print("Sending text to Gemini TTS...")
    print(f"Model: {MODEL}")
    print(f"Voice: {VOICE}")
    print(f"Text: {text}")
    print()

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "input": text,
        "voice": VOICE,
        "response_format": "mp3",
    }

    try:
        response = requests.post(
            URL,
            headers=headers,
            json=payload,
            timeout=120,
        )

        print("HTTP status:", response.status_code)

        if not response.ok:
            print("\nTTS request failed.")
            print(response.text)
            return

        audio_data = response.content

        if not audio_data:
            print("ERROR: OpenRouter returned empty audio.")
            return

        OUTPUT_FILE.write_bytes(audio_data)

        print("\nSUCCESS!")
        print(f"Audio bytes: {len(audio_data):,}")
        print(f"Saved to: {OUTPUT_FILE}")

    except requests.RequestException as exc:
        print("\nNetwork/API error:")
        print(exc)


if __name__ == "__main__":
    main()