import { useCallback,useEffect,useState } from 'react';

/** Waits before each new attempt; long enough to outlast a brief edge/bot-check block (~1 min). */
export const RETRY_DELAYS_MS = [1500, 5000, 15000, 40000];

/** Same file, new URL, so neither the browser nor the service worker replays the failed response. */
export const retryUrl = (src: string, attempt: number) => attempt ? `${src}${src.includes('?') ? '&' : '?'}retry=${attempt}` : src;

/**
 * Loads a decorative image with automatic retries. Returns the URL to render, whether it has
 * loaded (for a fade-in), and the handlers to put on the <img>.
 */
export function useRetryingImage(src: string) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!waiting) return;
    const timer = window.setTimeout(() => { setWaiting(false); setAttempt((n) => n + 1); }, RETRY_DELAYS_MS[attempt] ?? 0);
    return () => window.clearTimeout(timer);
  }, [waiting, attempt]);

  const onError = useCallback(() => {
    setLoaded(false);
    if (attempt < RETRY_DELAYS_MS.length) setWaiting(true);
  }, [attempt]);
  const onLoad = useCallback(() => setLoaded(true), []);

  return { url: retryUrl(src, attempt), loaded, failed: !waiting && attempt >= RETRY_DELAYS_MS.length && !loaded, onLoad, onError, attempt };
}
