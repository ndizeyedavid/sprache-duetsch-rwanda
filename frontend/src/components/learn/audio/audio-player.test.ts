import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';

/** Browser-like audio element: play() stays pending until start(); pause() before that rejects it with AbortError. */
class FakeAudio {
  static instances: FakeAudio[] = [];
  playbackRate = 1;
  preservesPitch = true;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private pending: { resolve: () => void; reject: (error: unknown) => void } | null = null;
  src: string;
  constructor(src: string) { this.src = src; FakeAudio.instances.push(this); }
  play() { return new Promise<void>((resolve, reject) => { this.pending = { resolve, reject }; }); }
  start() { this.pending?.resolve(); this.pending = null; }
  pause() { this.pending?.reject(new DOMException('The play() request was interrupted by a call to pause().', 'AbortError')); this.pending = null; }
  end() { this.onended?.(); }
}

const spoken: string[] = [];
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));
const clip = (url: string) => ({ ok: true, headers: { get: () => (url.includes('missing') ? 'text/html' : 'audio/mpeg') }, blob: async () => new Blob([url]) });

async function freshPlayer() {
  vi.resetModules();
  return import('./audio-player');
}

beforeEach(() => {
  FakeAudio.instances = [];
  spoken.length = 0;
  vi.stubGlobal('Audio', FakeAudio);
  vi.stubGlobal('fetch', vi.fn(async (url: string) => clip(url)));
  vi.spyOn(URL, 'createObjectURL').mockImplementation(() => `blob:${FakeAudio.instances.length}`);
  vi.stubGlobal('SpeechSynthesisUtterance', class { lang = ''; rate = 1; voice = null; onend: (() => void) | null = null; onerror = null; text: string; constructor(text: string) { this.text = text; } });
  vi.stubGlobal('speechSynthesis', { getVoices: () => [], cancel: vi.fn(), speak: (utterance: { text: string; onend: () => void }) => { spoken.push(utterance.text); setTimeout(utterance.onend, 0); } });
});

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('playClip', () => {
  it('plays a clip to the end', async () => {
    const { playClip } = await freshPlayer();
    const done = playClip({ url: '/audio/a.mp3', text: 'der Tisch' });
    await flush();
    FakeAudio.instances[0]?.start();
    FakeAudio.instances[0]?.end();
    await expect(done).resolves.toBe(true);
    expect(spoken).toEqual([]);
  });

  it('stays silent when the clip is stopped while it starts (no device voice repeating it)', async () => {
    const { playClip,stopClip } = await freshPlayer();
    const done = playClip({ url: '/audio/a.mp3', text: 'der Tisch' });
    await flush();
    stopClip();
    await flush();
    await expect(done).resolves.toBe(false);
    expect(spoken).toEqual([]);
  });

  it('stays silent when another clip replaces it while it starts', async () => {
    const { playClip } = await freshPlayer();
    const first = playClip({ url: '/audio/a.mp3', text: 'der Tisch' });
    await flush();
    void playClip({ url: '/audio/b.mp3', text: 'der Stuhl' });
    await flush();
    await expect(first).resolves.toBe(false);
    expect(spoken).toEqual([]);
    expect(FakeAudio.instances).toHaveLength(2);
  });

  it('plays a clip asked for twice at once (React dev mode, double tap) only once', async () => {
    const { playClip } = await freshPlayer();
    const first = playClip({ url: '/audio/a.mp3', text: 'der Tisch' });
    const second = playClip({ url: '/audio/a.mp3', text: 'der Tisch' });
    await flush();
    expect(FakeAudio.instances).toHaveLength(1);
    FakeAudio.instances[0]?.start();
    FakeAudio.instances[0]?.end();
    await expect(first).resolves.toBe(false);
    await expect(second).resolves.toBe(true);
  });

  it('falls back to the device voice only for a missing clip, reading the cleaned text', async () => {
    const { playClip } = await freshPlayer();
    await expect(playClip({ url: '/audio/missing.mp3', text: 'der Tisch, -e' })).resolves.toBe(true);
    expect(spoken).toEqual(['der Tisch']);
  });
});

describe('deviceText', () => {
  it('reads what the recordings read: no hints, gaps, plural endings, separators', async () => {
    const { deviceText } = await freshPlayer();
    expect(deviceText('Ich ___ nach Hause gegangen. (sein)')).toBe('Ich nach Hause gegangen.');
    expect(deviceText('die Stadt, ¨-e')).toBe('die Stadt');
    expect(deviceText('auf|stehen')).toBe('aufstehen');
    expect(deviceText('der Arzt / die Ärztin')).toBe('der Arzt, die Ärztin');
    expect(deviceText('Guten Tag! — Hallo!')).toBe('Guten Tag! Hallo!');
  });
});
