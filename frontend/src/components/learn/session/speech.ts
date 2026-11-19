// Browser speech recognition (Chrome/Edge/Android, Safari 14.5+) for "say this sentence".
// Not available everywhere: callers fall back to "I said it".
type Alternative = { transcript: string };
type RecognitionEvent = { results: ArrayLike<ArrayLike<Alternative>> };
type Recognition = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  start(): void; stop(): void; abort(): void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionClass = new () => Recognition;

function recognitionClass(): RecognitionClass | null {
  const scope = window as unknown as { SpeechRecognition?: RecognitionClass; webkitSpeechRecognition?: RecognitionClass };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export const canRecognizeSpeech = () => typeof window !== 'undefined' && recognitionClass() !== null;

/** Listen once in German; resolves with every alternative heard (best first), or rejects with a reason. */
export function listenOnce(): { result: Promise<string[]>; stop: () => void } {
  const Klass = recognitionClass();
  if (!Klass) return { result: Promise.reject(new Error('unsupported')), stop: () => {} };
  const recognition = new Klass();
  recognition.lang = 'de-DE';
  recognition.interimResults = false;
  recognition.maxAlternatives = 4;
  recognition.continuous = false;
  const result = new Promise<string[]>((resolve, reject) => {
    let heard: string[] = [];
    recognition.onresult = (event) => {
      heard = Array.from(event.results).flatMap((alternatives) => Array.from(alternatives).map((alternative) => alternative.transcript.trim()));
    };
    recognition.onerror = (event) => reject(new Error(event.error));
    recognition.onend = () => resolve(heard);
  });
  recognition.start();
  return { result, stop: () => recognition.stop() };
}
