"""Generate the MP3 clips a course v2 import needs (free, offline Piper voices).

Usage (from backend/):
  ~/.cache/dsrw-tts/venv/bin/python prisma/course-import/v2/generate_audio.py prisma/course-import/v2/audio-A1.json

Setup once: python3 -m venv ~/.cache/dsrw-tts/venv && ~/.cache/dsrw-tts/venv/bin/pip install piper-tts
and download the voices named in v2/audio.ts (VOICES) from huggingface.co/rhasspy/piper-voices
into ~/.cache/dsrw-tts/voices (override with PIPER_VOICES). ffmpeg must be installed.
Clips that already exist are skipped, so re-running only fills the gaps; --prune then deletes clips
that no level manifest (v2/audio-*.json, always the whole level) uses any more. A voice name such as
"mls-medium-102" means model de_DE-mls-medium.onnx with speaker 102. A clip with "parts" is a test
conversation (v2/script.ts): each turn in its own voice, evened out in loudness, joined with short pauses.
"""
import json
import os
import re
import subprocess
import sys
import tempfile
import time
import wave

import numpy as np

from piper import PiperVoice, SynthesisConfig

VOICES_DIR = os.environ.get("PIPER_VOICES", os.path.expanduser("~/.cache/dsrw-tts/voices"))
PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../../../../frontend/public")
# A touch slower than Piper's default so learners hear every syllable (the app also has a slow
# button), and calmer than the default noise (0.667/0.8): clearer, steadier words in Whisper checks.
LENGTH_SCALE = 1.08
NOISE_SCALE = 0.3
NOISE_W_SCALE = 0.35
RATE = 22050
TURN_PAUSE_SECONDS = 0.5
TURN_RMS = 0.08


def load_voice(name, cache):
    if name not in cache:
        match = re.fullmatch(r"(.+)-(\d+)", name)
        model, speaker = (match.group(1), int(match.group(2))) if match else (name, None)
        voice = PiperVoice.load(os.path.join(VOICES_DIR, f"de_DE-{model}.onnx"))
        cache[name] = (voice, SynthesisConfig(length_scale=LENGTH_SCALE, noise_scale=NOISE_SCALE, noise_w_scale=NOISE_W_SCALE, speaker_id=speaker))
    return cache[name]


def synthesize(voice_name, text, path, cache):
    voice, config = load_voice(voice_name, cache)
    with wave.open(path, "wb") as wav:
        voice.synthesize_wav(text, wav, syn_config=config)


def samples(path):
    """Mono float samples at RATE, whatever rate the voice model produced (low voices are 16 kHz)."""
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(RATE), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def render(clip, tmp, cache):
    """WAV of one clip: a single voice, or a conversation's turns at even loudness with pauses between."""
    wav_path = os.path.join(tmp, "clip.wav")
    if "parts" not in clip:
        synthesize(clip["voice"], clip["text"], wav_path, cache)
        return wav_path
    pause, turns = np.zeros(int(RATE * TURN_PAUSE_SECONDS), np.float32), []
    for part in clip["parts"]:
        turn_path = os.path.join(tmp, "turn.wav")
        synthesize(part["voice"], part["text"], turn_path, cache)
        turn = samples(turn_path)
        rms = float(np.sqrt(np.mean(turn ** 2))) if turn.size else 0
        turns += [pause, turn * (TURN_RMS / rms) if rms else turn]
    joined = np.clip(np.concatenate(turns[1:]), -1, 1)
    with wave.open(wav_path, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes((joined * 32767).astype(np.int16).tobytes())
    return wav_path


def encode(wav_path, target):
    """Mono 22 kHz MP3 at 40 kbit/s (clear speech, ~5 KB per second) with a short lead-in so phones do
    not clip the first syllable."""
    os.makedirs(os.path.dirname(target), exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav_path, "-af", "adelay=120:all=1,apad=pad_dur=0.12",
                    "-ac", "1", "-ar", "22050", "-codec:a", "libmp3lame", "-b:a", "40k", target], check=True)


def prune(manifest_dir):
    """Delete clips no level manifest (audio-*.json) references any more."""
    wanted = set()
    for name in os.listdir(manifest_dir):
        if re.fullmatch(r"audio-[A-Z0-9]+(-tests|-words)?\.json", name):
            wanted.update(clip["url"] for clip in json.load(open(os.path.join(manifest_dir, name))))
    removed = 0
    for root, _, files in os.walk(os.path.join(PUBLIC_DIR, "audio")):
        for name in files:
            path = os.path.join(root, name)
            if "/audio/" + os.path.relpath(path, os.path.join(PUBLIC_DIR, "audio")) not in wanted:
                os.remove(path)
                removed += 1
    print(f"pruned {removed} unused clips")


def main(manifest_path):
    clips = json.load(open(manifest_path))
    todo = [clip for clip in clips if not os.path.exists(PUBLIC_DIR + clip["url"])]
    print(f"{len(clips)} clips in manifest, {len(todo)} to generate", flush=True)
    cache, started = {}, time.time()
    with tempfile.TemporaryDirectory() as tmp:
        for index, clip in enumerate(todo, 1):
            encode(render(clip, tmp, cache), PUBLIC_DIR + clip["url"])
            if index % 50 == 0:
                print(f"  {index}/{len(todo)} ({time.time() - started:.0f}s)", flush=True)
    print(f"done in {time.time() - started:.0f}s", flush=True)


if __name__ == "__main__":
    args = [arg for arg in sys.argv[1:] if arg != "--prune"]
    if len(args) != 1:
        sys.exit(__doc__)
    main(args[0])
    if "--prune" in sys.argv:
        prune(os.path.dirname(os.path.abspath(args[0])))
