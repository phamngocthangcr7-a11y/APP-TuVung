import io
import json
import logging
import shutil
import tempfile
import threading
import urllib.request
import wave
from http.server import BaseHTTPRequestHandler
from pathlib import Path

from piper import PiperVoice


VOICE_NAME = "en_US-norman-medium"
VOICE_DIRECTORY = (
    "https://huggingface.co/rhasspy/piper-voices/resolve/e70533d/"
    "en/en_US/norman/medium/"
)
MODEL_CACHE = Path(tempfile.gettempdir()) / "vocab-toeic-piper-norman-e70533d"
voice_lock = threading.Lock()
voice = None


def load_voice():
    global voice
    if voice is not None:
        return voice
    with voice_lock:
        if voice is not None:
            return voice
        MODEL_CACHE.mkdir(parents=True, exist_ok=True)
        for suffix in (".onnx", ".onnx.json"):
            model_file = MODEL_CACHE / (VOICE_NAME + suffix)
            if model_file.is_file():
                continue
            with urllib.request.urlopen(VOICE_DIRECTORY + model_file.name, timeout=20) as download:
                with tempfile.NamedTemporaryFile(dir=MODEL_CACHE, delete=False) as temporary:
                    temporary_path = Path(temporary.name)
                    try:
                        shutil.copyfileobj(download, temporary)
                    except Exception:
                        temporary.close()
                        temporary_path.unlink(missing_ok=True)
                        raise
                temporary_path.replace(model_file)
        voice = PiperVoice.load(MODEL_CACHE / (VOICE_NAME + ".onnx"))
        return voice


def make_audio(text):
    speaker = load_voice()
    audio = io.BytesIO()
    with wave.open(audio, "wb") as wav:
        speaker.synthesize_wav(text, wav)
    return audio.getvalue()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 1 <= length <= 8192:
                raise ValueError("Invalid request length")
            payload = json.loads(self.rfile.read(length))
            text = payload.get("text", "") if isinstance(payload, dict) else ""
            text = " ".join(text.split()) if isinstance(text, str) else ""
            if not 1 <= len(text) <= 500 or not any(character.isalnum() for character in text):
                raise ValueError("Invalid pronunciation text")
        except (ValueError, UnicodeError):
            self.send_error(400, "Enter 1 to 500 characters of text")
            return

        try:
            audio = make_audio(text)
        except Exception:
            logging.exception("Pronunciation service could not synthesize audio")
            self.send_error(503, "Pronunciation temporarily unavailable")
            return
        self.send_response(200)
        self.send_header("Content-Type", "audio/wav")
        self.send_header("Content-Length", str(len(audio)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(audio)
