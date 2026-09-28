import os
import json
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

ENV_PATH = BASE_DIR / ".env"

TRANSLATIONS_PATH = (
    BASE_DIR / "translation" / "translations.json"
)


# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv(ENV_PATH)

API_KEY = os.getenv("OPENROUTER_API_KEY")


# ============================================================
# OPENROUTER SETTINGS
# ============================================================

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# We use a specific model instead of the generic free router.
#
# This makes the response much more predictable.
MODEL = "openai/gpt-4.1-mini"


# ============================================================
# OPENROUTER CLIENT
# ============================================================

if not API_KEY:

    raise RuntimeError(
        "OPENROUTER_API_KEY was not found.\n\n"
        "Make sure your .env file contains:\n"
        "OPENROUTER_API_KEY=your_key_here"
    )


client = OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=API_KEY
)


# ============================================================
# LOAD LOCAL TRANSLATIONS
# ============================================================

def load_translations():

    if not TRANSLATIONS_PATH.exists():
        return {}

    try:

        with open(
            TRANSLATIONS_PATH,
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    except Exception as e:

        print(
            f"WARNING: Could not load translations.json: {e}"
        )

        return {}


# ============================================================
# SAVE LOCAL TRANSLATIONS
# ============================================================

def save_translations(translations):

    TRANSLATIONS_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        TRANSLATIONS_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            translations,
            file,
            ensure_ascii=False,
            indent=4
        )


# ============================================================
# TRANSLATE ONE GESTURE
# ============================================================

def translate_gesture(gesture):

    translations = load_translations()


    # --------------------------------------------------------
    # CHECK CACHE
    # --------------------------------------------------------

    if gesture in translations:

        print(
            f"Using cached translation for: {gesture}"
        )

        return translations[gesture]


    # --------------------------------------------------------
    # PROMPT
    # --------------------------------------------------------

    prompt = f"""
Translate the following English phrase into
natural Hindi and natural Marathi.

English phrase:
{gesture}

Return exactly this format:

English: {gesture}
Hindi: <Hindi translation>
Marathi: <Marathi translation>

Do not provide explanations.
Do not provide safety messages.
Do not use markdown.
Do not use JSON.
"""


    # --------------------------------------------------------
    # API REQUEST
    # --------------------------------------------------------

    print(
        f"Translating '{gesture}' using OpenRouter..."
    )

    try:

        response = client.chat.completions.create(
    model=MODEL,

    messages=[
        {
            "role": "system",
            "content": (
                "You are a translation engine. "
                "Translate English phrases into "
                "natural Hindi and Marathi. "
                "Follow the requested output format exactly."
            )
        },
        {
            "role": "user",
            "content": prompt
        }
    ],

    temperature=0,

    max_tokens=100
)

    except Exception as e:

        raise RuntimeError(
            f"OpenRouter API request failed:\n{e}"
        )


    # --------------------------------------------------------
    # CHECK RESPONSE
    # --------------------------------------------------------

    if not response.choices:

        raise RuntimeError(
            "OpenRouter returned no choices."
        )


    content = response.choices[0].message.content


    if not content:

        raise RuntimeError(
            "OpenRouter returned an empty response."
        )


    content = content.strip()


    # --------------------------------------------------------
    # DEBUG OUTPUT
    # --------------------------------------------------------

    print("\nOpenRouter returned:")
    print(content)


    # --------------------------------------------------------
    # PARSE TRANSLATION
    # --------------------------------------------------------

    result = {}

    for line in content.splitlines():

        line = line.strip()

        lower_line = line.lower()


        if lower_line.startswith("english:"):

            result["english"] = (
                line.split(":", 1)[1].strip()
            )


        elif lower_line.startswith("hindi:"):

            result["hindi"] = (
                line.split(":", 1)[1].strip()
            )


        elif lower_line.startswith("marathi:"):

            result["marathi"] = (
                line.split(":", 1)[1].strip()
            )


    # --------------------------------------------------------
    # VALIDATE
    # --------------------------------------------------------

    required_keys = [
        "english",
        "hindi",
        "marathi"
    ]

    missing = [
        key
        for key in required_keys
        if key not in result
    ]


    if missing:

        raise RuntimeError(
            "Could not understand the translation response.\n\n"
            f"Missing fields: {', '.join(missing)}\n\n"
            f"Raw response:\n{content}"
        )


    # --------------------------------------------------------
    # SAVE TO CACHE
    # --------------------------------------------------------

    translations[gesture] = result

    save_translations(
        translations
    )


    print(
        f"\nTranslation saved for: {gesture}"
    )


    return result


# ============================================================
# GET CACHED TRANSLATION
# ============================================================

def get_cached_translation(gesture):

    translations = load_translations()

    return translations.get(
        gesture
    )


# ============================================================
# GET TEXT IN SELECTED LANGUAGE
# ============================================================

def get_text(
    gesture,
    language="English"
):

    translation = get_cached_translation(
        gesture
    )


    if translation is None:

        translation = translate_gesture(
            gesture
        )


    language_key = language.lower()


    if language_key == "english":

        return translation["english"]


    if language_key == "hindi":

        return translation["hindi"]


    if language_key == "marathi":

        return translation["marathi"]


    raise ValueError(
        f"Unsupported language: {language}"
    )


# ============================================================
# TRANSLATE ALL GESTURES
# ============================================================

def translate_all_gestures(gestures):

    results = {}


    for gesture in gestures:

        try:

            result = translate_gesture(
                gesture
            )

            results[gesture] = result


        except Exception as e:

            print(
                f"\nERROR translating '{gesture}':"
            )

            print(e)


    return results


# ============================================================
# MAIN TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("VAANI TRANSLATION SYSTEM")
    print("=" * 60)


    gestures = [
        "Good",
        "Hello",
        "Hi",
        "Please",
        "Thank You",
        "Yes",
        "No"
    ]


    results = translate_all_gestures(
        gestures
    )


    print("\n")
    print("=" * 60)
    print("TRANSLATIONS")
    print("=" * 60)


    for gesture, translation in results.items():

        print(
            f"\n{gesture}"
        )

        print(
            f"  English : {translation['english']}"
        )

        print(
            f"  Hindi   : {translation['hindi']}"
        )

        print(
            f"  Marathi : {translation['marathi']}"
        )


    print("\n")
    print("Translation process complete.")
