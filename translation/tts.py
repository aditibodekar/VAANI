from pathlib import Path
import asyncio
import hashlib

import edge_tts


BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_DIR = BASE_DIR / "translation" / "tts_cache"

CACHE_DIR.mkdir(parents=True, exist_ok=True)


VOICE_MAP = {
    "English": "en-IN-NeerjaNeural",
    "Hindi": "hi-IN-SwaraNeural",
    "Marathi": "mr-IN-AarohiNeural",
}


def _cache_path(text: str, language: str) -> Path:
    """Create a stable filename for a text + language combination."""
    key = hashlib.sha256(
        f"{language}:{text}".encode("utf-8")
    ).hexdigest()

    return CACHE_DIR / f"{key}.mp3"


async def _generate_audio(
    text: str,
    voice: str,
    output_path: Path,
) -> None:
    """Generate speech using Edge TTS."""
    communicate = edge_tts.Communicate(
        text=text,
        voice=voice,
    )

    await communicate.save(str(output_path))


def synthesize(text: str, language: str) -> Path:
    """
    Generate speech and return the cached MP3 path.

    If the same translation has already been generated,
    the cached audio is reused.
    """
    text = (text or "").strip()
    language = (language or "").strip()

    if not text:
        raise ValueError("Text cannot be empty.")

    if language not in VOICE_MAP:
        raise ValueError(
            f"Unsupported language: {language}"
        )

    output_path = _cache_path(text, language)

    if output_path.exists() and output_path.stat().st_size > 0:
        return output_path

    voice = VOICE_MAP[language]

    asyncio.run(
        _generate_audio(
            text,
            voice,
            output_path,
        )
    )

    return output_path