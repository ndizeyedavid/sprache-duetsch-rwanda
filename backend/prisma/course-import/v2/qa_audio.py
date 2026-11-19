"""Listen-check generated clips: Whisper transcribes each one and clips that do not match their text
are listed for a human to hear (and fix with a `say` override in the pack).

Usage (from backend/):
  ~/.cache/dsrw-tts/venv/bin/python prisma/course-import/v2/qa_audio.py prisma/course-import/v2/audio-A1.json [--sample 200]

Needs `pip install faster-whisper numpy` in the same venv. Scores are word recall (0–1); Whisper itself
mishears names and digits, so a low score means "listen to this one", not "this is wrong".
"""
import json
import os
import random
import re
import subprocess
import sys

import numpy as np
from faster_whisper import WhisperModel

PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../frontend/public")
NUMBERS = {"0": "null", "1": "eins", "2": "zwei", "3": "drei", "4": "vier", "5": "fünf", "6": "sechs", "7": "sieben", "8": "acht", "9": "neun", "10": "zehn", "12": "zwölf"}


def words(text):
    text = re.sub(r"\b\d+\b", lambda m: NUMBERS.get(m.group(0), m.group(0)), text.lower())
    return re.sub(r"[^\wäöüß ]", " ", text).split()


def load(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", "16000", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def main(manifest, sample):
    clips = [clip for clip in json.load(open(manifest)) if os.path.exists(PUBLIC_DIR + clip["url"])]
    if sample and len(clips) > sample:
        clips = random.Random(7).sample(clips, sample)
    model = WhisperModel("small", device="cpu", compute_type="int8")
    flagged = []
    for clip in clips:
        segments, _ = model.transcribe(load(PUBLIC_DIR + clip["url"]), language="de", beam_size=5)
        heard = " ".join(segment.text for segment in segments).strip()
        text = clip.get("text") or " ".join(part["text"] for part in clip["parts"])
        expected, got = words(text), set(words(heard))
        score = sum(1 for word in expected if word in got) / max(1, len(expected))
        if score < 0.8:
            flagged.append((score, clip.get("voice", "dialogue"), text, heard, clip["url"]))
    for score, voice, text, heard, url in sorted(flagged):
        print(f"{score:.2f} [{voice}] {text!r}\n      heard: {heard!r}\n      {url}")
    print(f"{len(flagged)} of {len(clips)} clips to listen to")


if __name__ == "__main__":
    args = sys.argv[1:]
    if not args:
        sys.exit(__doc__)
    main(args[0], int(args[args.index("--sample") + 1]) if "--sample" in args else 0)
