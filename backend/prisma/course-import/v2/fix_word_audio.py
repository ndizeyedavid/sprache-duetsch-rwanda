"""Listen-check single words and short phrases (tap-a-word meanings, word-list words) and repair the
ones that come out wrong.

Piper's Thorsten voice often garbles the first sound of a word said on its own ("koche" was heard as
"paura"), while the same word inside a sentence is clear. Whisper hears each clip after a carrier phrase
in the same voice ("Das nächste Wort ist …"), like a listener who knows a word is coming. A clip it
mishears is synthesised again, in this order, until a version is heard right:
  1. with a full stop ("koche.")
  2. inside a frame that is cut off at its pause ("Das Wort ist: … koche.")
  3. after a pause ("… koche")
The first version heard right replaces the clip (same URL). Clips no version gets right are listed in
v2/audio-skip.json: the import gives those words no recording, so the app shows no speaker instead of a
wrong word. Results are cached in ~/.cache/dsrw-tts/word-check.json, so a re-run only checks new clips.

Usage (from backend/), after generate_audio.py and before the import's --apply:
  ~/.cache/dsrw-tts/venv/bin/python prisma/course-import/v2/fix_word_audio.py prisma/course-import/v2/audio-A1-words.json [more manifests] [--jobs 3]
"""
import json
import math
import multiprocessing
import os
import re
import subprocess
import sys
import tempfile
import time
import wave
from difflib import SequenceMatcher

import numpy as np
from scipy.signal import resample_poly

from generate_audio import PUBLIC_DIR, encode, load_voice

CARRIER = "Das nächste Wort ist"
MAX_WORDS = 3
RATE = 16000
SKIP_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio-skip.json")
CACHE_FILE = os.path.expanduser("~/.cache/dsrw-tts/word-check.json")
ONES = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn",
        "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn"]
TENS = ["", "", "zwanzig", "dreißig", "vierzig", "fünfzig", "sechzig", "siebzig", "achtzig", "neunzig"]


def german_number(n):
    """Whisper writes numbers as digits ("48"); the clips say them as words ("achtundvierzig")."""
    if n < 20:
        return ONES[n]
    if n < 100:
        return ("" if n % 10 == 0 else ("ein" if n % 10 == 1 else ONES[n % 10]) + "und") + TENS[n // 10]
    if n < 1000:
        return ("ein" if n // 100 == 1 else ONES[n // 100]) + "hundert" + (german_number(n % 100) if n % 100 else "")
    return ("ein" if n // 1000 == 1 else german_number(n // 1000)) + "tausend" + (german_number(n % 1000) if n % 1000 else "")

worker = {}


def letters(text):
    text = re.sub(r"\d+", lambda match: german_number(int(match.group(0))) if len(match.group(0)) <= 4 else match.group(0), text.lower())
    return re.sub(r"[^a-zäöüß]", "", text)


def heard_right(heard, text):
    """The words after the carrier are the clip's words (exactly, or one letter off like a lost umlaut)."""
    got, want, start = letters(heard), letters(text), len(letters(CARRIER))
    for cut in range(max(0, start - 3), start + 4):  # Whisper may blur the carrier's last letters into the word
        tail = got[cut:]
        if tail == want or (abs(len(tail) - len(want)) <= 1 and SequenceMatcher(None, tail, want).ratio() >= 0.85):
            return True
    return False


def to_16k(audio, rate):
    divisor = math.gcd(RATE, rate)
    return resample_poly(audio, RATE // divisor, rate // divisor).astype(np.float32)


def mp3_samples(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "s16le", "-ac", "1", "-ar", str(RATE), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def synth(voice_name, text):
    voice, config = load_voice(voice_name, worker["voices"])
    chunks = list(voice.synthesize(text, syn_config=config))
    return np.concatenate([chunk.audio_float_array for chunk in chunks]), chunks[0].sample_rate


def quiet_runs(audio, rate, min_seconds=0.12):
    """(start, end) samples of pauses at least min_seconds long."""
    step = int(rate * 0.01)
    loud = np.sqrt(np.convolve(audio ** 2, np.ones(step) / step, mode="same"))[::step] >= 0.012
    runs, start = [], None
    for index, is_loud in enumerate(list(loud) + [True]):
        if not is_loud and start is None:
            start = index
        elif is_loud and start is not None:
            if (index - start) * 0.01 >= min_seconds:
                runs.append((start * step, index * step))
            start = None
    return runs


def trim_start(audio, rate):
    voiced = np.where(np.abs(audio) > 0.012)[0]
    return audio[max(0, voiced[0] - int(rate * 0.05)):] if len(voiced) else audio


def candidate(method, voice_name, text):
    """Another way to say `text` alone, or None when the frame has no pause to cut at."""
    if method == "full stop":
        return synth(voice_name, f"{text.rstrip('.!?')}.")
    if method == "pause first":
        audio, rate = synth(voice_name, f"… {text}")
        return trim_start(audio, rate), rate
    audio, rate = synth(voice_name, f"Das Wort ist: … {text}.")
    inner = [run for run in quiet_runs(audio, rate) if run[0] > 0.3 * rate and run[1] < len(audio) - 0.15 * rate]
    return (audio[max(0, inner[-1][1] - int(0.03 * rate)):], rate) if inner else None


def transcribe(audio16):
    # One greedy pass: retries at higher temperatures cost 6× on exactly the unclear clips and change no verdict.
    segments, _ = worker["model"].transcribe(audio16, language="de", beam_size=1, temperature=0.0, condition_on_previous_text=False,
                                             without_timestamps=True)
    return " ".join(segment.text for segment in segments)


def judge_many(items):
    """[(audio16, text)] → [heard right?]. Whisper always works on a 30-second window, so several
    "carrier + clip" pairs share one window and the transcript is split at the carrier (4× faster); a
    window whose transcript does not split into one part per clip is judged clip by clip."""
    pause = np.zeros(int(RATE * 0.25), np.float32)
    pieces = [np.concatenate([worker["carrier"], pause, audio16, pause, pause]) for audio16, _ in items]
    windows, current, seconds = [], [], 0.0
    for index, piece in enumerate(pieces):
        if current and seconds + len(piece) / RATE > 26:
            windows.append(current)
            current, seconds = [], 0.0
        current.append(index)
        seconds += len(piece) / RATE
    if current:
        windows.append(current)
    verdicts = [False] * len(items)
    for window in windows:
        parts = re.split(r"das\s+n[äa]chste\s+wort\s+ist", transcribe(np.concatenate([pause] + [pieces[i] for i in window])), flags=re.I)
        if len(parts) == len(window) + 1 and not letters(parts[0]):
            for index, part in zip(window, parts[1:]):
                verdicts[index] = heard_right(f"{CARRIER} {part}", items[index][1])
        else:
            for index in window:
                verdicts[index] = heard_right(transcribe(np.concatenate([pause, pieces[index]])), items[index][1])
    return verdicts


def start_worker(threads):
    from faster_whisper import WhisperModel
    worker["voices"] = {}
    worker["model"] = WhisperModel("small", device="cpu", compute_type="int8", cpu_threads=threads)
    audio, rate = synth("thorsten-high", CARRIER)
    worker["carrier"] = to_16k(audio, rate)


def write_clip(audio, rate, path):
    with tempfile.TemporaryDirectory() as tmp:
        wav_path = os.path.join(tmp, "clip.wav")
        with wave.open(wav_path, "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(rate)
            wav.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
        encode(wav_path, path)


def check_batch(clips):
    """[(url, status)]: the clip as it is, else the first other version heard right (written over it), else skip."""
    results, pending = [], list(clips)
    for method in (None, "full stop", "frame cut", "pause first"):
        if not pending:
            break
        made = {}
        for clip in pending:
            if method is None:
                made[clip["url"]] = (mp3_samples(PUBLIC_DIR + clip["url"]), None)
            else:
                version = candidate(method, clip["voice"], clip["text"])
                if version is not None:
                    made[clip["url"]] = (to_16k(*version), version)
        tried = [clip for clip in pending if clip["url"] in made]
        verdicts = judge_many([(made[clip["url"]][0], clip["text"]) for clip in tried])
        passed = {clip["url"] for clip, verdict in zip(tried, verdicts) if verdict}
        for clip in tried:
            if clip["url"] not in passed:
                continue
            if method is not None:
                write_clip(*made[clip["url"]][1], PUBLIC_DIR + clip["url"])
            results.append((clip["url"], "ok" if method is None else f"fixed: {method}"))
        pending = [clip for clip in pending if clip["url"] not in passed]
    return results + [(clip["url"], "skip") for clip in pending]


def main(manifests, jobs):
    cache = json.load(open(CACHE_FILE)) if os.path.exists(CACHE_FILE) else {}
    clips = {}
    for manifest in manifests:
        for clip in json.load(open(manifest)):
            text = clip.get("text", "")
            if "parts" not in clip and 0 < len(text.split()) <= MAX_WORDS and os.path.exists(PUBLIC_DIR + clip["url"]):
                clips[clip["url"]] = clip
    size = lambda url: os.path.getsize(PUBLIC_DIR + url)
    todo = [clip for url, clip in clips.items() if cache.get(url, {}).get("size") != size(url)]
    print(f"{len(clips)} words and short phrases, {len(todo)} to check with {jobs} workers", flush=True)
    started, counts = time.time(), {}
    batches, done = [todo[start:start + 48] for start in range(0, len(todo), 48)], 0
    with multiprocessing.Pool(jobs, initializer=start_worker, initargs=(max(1, os.cpu_count() // jobs),)) as pool:
        for results in pool.imap_unordered(check_batch, batches):
            for url, status in results:
                cache[url] = {"status": status, "size": size(url)}
                counts[status] = counts.get(status, 0) + 1
            done += len(results)
            json.dump(cache, open(CACHE_FILE, "w"))
            print(f"  {done}/{len(todo)} ({time.time() - started:.0f}s) {counts}", flush=True)
    json.dump(cache, open(CACHE_FILE, "w"))
    skipped = set(json.load(open(SKIP_FILE))) if os.path.exists(SKIP_FILE) else set()
    skipped = (skipped - set(clips)) | {url for url in clips if cache[url]["status"] == "skip"}
    with open(SKIP_FILE, "w") as handle:
        handle.write(json.dumps(sorted(skipped), indent=1) + "\n")
    print(f"done in {time.time() - started:.0f}s: {counts}; {len(skipped)} clips in {os.path.basename(SKIP_FILE)}", flush=True)


if __name__ == "__main__":
    args = sys.argv[1:]
    jobs = int(args[args.index("--jobs") + 1]) if "--jobs" in args else 3
    paths = [arg for index, arg in enumerate(args) if arg != "--jobs" and (index == 0 or args[index - 1] != "--jobs")]
    if not paths:
        sys.exit(__doc__)
    main(paths, jobs)
