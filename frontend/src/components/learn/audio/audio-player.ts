// One shared player for every German clip in the app: pre-generated MP3s from /audio (cached by the
// service worker after the first play). Only one clip plays at a time: a new play, or stopClip(),
// ends the one before it for good. The device's German voice is a last resort for a clip that
// cannot load (offline, missing). It never speaks for a clip that was stopped or replaced, and it
// reads the same cleaned text as the recordings.
type Listener = (playingKey: string | null) => void;
type Playing = { id: number; key: string; audio?: HTMLAudioElement; finish: (completed: boolean) => void };

const blobs = new Map<string, Promise<string | null>>();
const listeners = new Set<Listener>();
let current: Playing | null = null;
let lastId = 0;

const notify = () => listeners.forEach((listener) => listener(current?.key ?? null));

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Fetch a clip once; null when it does not exist (the dev server answers index.html with 200). */
function loadClip(url: string): Promise<string | null> {
  let pending = blobs.get(url);
  if (!pending) {
    pending = fetch(url).then(async (response) => {
      const type = response.headers.get('content-type') ?? '';
      if (!response.ok || !type.startsWith('audio/')) return null;
      return URL.createObjectURL(await response.blob());
    }).catch(() => null);
    blobs.set(url, pending);
  }
  return pending;
}

export function preloadClip(url?: string) {
  if (url) void loadClip(url);
}

export function stopClip() {
  const playing = current;
  current = null;
  playing?.audio?.pause();
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  playing?.finish(false);
  notify();
}

/** What the device voice reads: no hints in brackets, plural endings ("der Tisch, -e"), gaps, slashes or arrows. */
export function deviceText(text: string): string {
  return text
    .replace(/[↘↗→←↑↓|]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/,\s*(?:¨?-\p{L}*|¨)\s*$/u, '')
    .replace(/…|\.\.\.|_{3,}/g, '')
    .replace(/\s+[—–]\s+|\s*\/\s*/g, ', ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([.!?])\s*[,;:]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Resolves false when the speech was cancelled (stopClip), true otherwise, including no device voice at all. */
function speakWithDevice(text: string, slow: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') { resolve(true); return; }
    const utterance = new SpeechSynthesisUtterance(deviceText(text));
    utterance.lang = 'de-DE';
    utterance.rate = slow ? 0.6 : 0.9;
    const voice = speechSynthesis.getVoices().find((item) => item.lang.toLowerCase().startsWith('de'));
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve(true);
    utterance.onerror = (event) => resolve(event.error !== 'interrupted' && event.error !== 'canceled');
    speechSynthesis.speak(utterance);
  });
}

/**
 * Play `url` (or speak `text` with the device voice when there is no clip). Resolves true when it
 * played to the end, false when it was stopped or another clip replaced it.
 */
export function playClip({ url, text, slow = false }: { url?: string; text: string; slow?: boolean }): Promise<boolean> {
  stopClip();
  const id = ++lastId;
  return new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (completed: boolean) => {
      if (settled) return;
      settled = true;
      if (current?.id === id) { current = null; notify(); }
      resolve(completed);
    };
    const playing: Playing = { id, key: clipKey(url, text, slow), finish };
    const live = () => current === playing;
    // Only a clip that is still the one playing may fall back (once, however many errors fire);
    // a stopped one rejects with AbortError and stays silent.
    let fellBack = false;
    const fallBack = () => {
      if (fellBack || !live()) return;
      fellBack = true;
      void speakWithDevice(text, slow).then(finish);
    };
    current = playing;
    notify();
    void (url ? loadClip(url) : Promise.resolve(null)).then((source) => {
      if (!live()) return;
      if (!source) { fallBack(); return; }
      const audio = new Audio(source);
      audio.playbackRate = slow ? 0.7 : 1;
      audio.preservesPitch = true;
      playing.audio = audio;
      audio.onended = () => finish(true);
      audio.onerror = fallBack;
      audio.play().catch((error: unknown) => { if (!(error instanceof DOMException && error.name === 'AbortError')) fallBack(); });
    });
  });
}

export const clipKey = (url: string | undefined, text: string, slow = false) => `${url ?? text}|${slow ? 'slow' : 'normal'}`;
