import io
import json
import logging
import math
import shutil
import tempfile
import threading
import urllib.request
import wave
from http.server import BaseHTTPRequestHandler
from pathlib import Path

import numpy as np
from kokoro_onnx import Kokoro


VOICE_NAME = "am_michael"
MODEL_NAME = "kokoro-v1.0.int8.onnx"
VOICES_NAME = "voices-v1.0.bin"
MODEL_DIRECTORY = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
MODEL_CACHE = Path(tempfile.gettempdir()) / "vocab-toeic-kokoro-v1"
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
        for name in (MODEL_NAME, VOICES_NAME):
            model_file = MODEL_CACHE / name
            if model_file.is_file():
                continue
            with urllib.request.urlopen(MODEL_DIRECTORY + name, timeout=20) as download:
                with tempfile.NamedTemporaryFile(dir=MODEL_CACHE, delete=False) as temporary:
                    temporary_path = Path(temporary.name)
                    try:
                        shutil.copyfileobj(download, temporary)
                    except Exception:
                        temporary.close()
                        temporary_path.unlink(missing_ok=True)
                        raise
                temporary_path.replace(model_file)
        voice = Kokoro(str(MODEL_CACHE / MODEL_NAME), str(MODEL_CACHE / VOICES_NAME))
        return voice


def make_audio(text, speed):
    speaker = load_voice()
    samples, sample_rate = speaker.create(text, voice=VOICE_NAME, speed=speed, lang="en-us")
    pcm = (np.clip(samples, -1.0, 1.0) * 32767).astype("<i2")
    audio = io.BytesIO()
    with wave.open(audio, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(pcm.tobytes())
    return audio.getvalue()


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if not 1 <= length <= 8192:
                raise ValueError("Invalid request length")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise ValueError("Invalid pronunciation payload")
            text = payload.get("text", "")
            speed = payload.get("speed", 0.9)
            if not isinstance(speed, (int, float)) or not math.isfinite(speed) or not 0.6 <= speed <= 1.2:
                raise ValueError("Invalid pronunciation speed")
            text = " ".join(text.split()) if isinstance(text, str) else ""
            if not 1 <= len(text) <= 500 or not any(character.isalnum() for character in text):
                raise ValueError("Invalid pronunciation text")
        except (ValueError, UnicodeError):
            self.send_error(400, "Invalid pronunciation input")
            return

        try:
            audio = make_audio(text, speed)
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
