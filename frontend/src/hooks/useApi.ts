import { useCallback, useEffect, useState } from 'react';

export type ApiState<T> = {
  data: T | null;
  loading: boolean;
  fetching: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * Minimal fetch hook for backend `{ success, data }` endpoints.
 * Pass a stable key; changing it refetches.
 *
 * Set `enabled` to false while the fetch has no valid target (e.g. nothing is
 * selected yet) so we never call an endpoint with an empty id.
 */
export function useApi<T>(
  key: string,
  fetcher: () => Promise<T>,
  enabled = true,
): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setError(null);
      setLoading(false);
      setFetching(false);
      return;
    }
    let cancelled = false;
    // Only show full loading on first fetch — background refetches keep current data
    // so the inbox/thread doesn't flash LoadingBlock on every poll or send.
    const isInitial = data === null;
    if (isInitial) setLoading(true);
    setFetching(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          setLoading(false);
          setFetching(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong.');
          setLoading(false);
          setFetching(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, nonce, enabled]);

  return { data, loading, fetching, error, refetch };
}
