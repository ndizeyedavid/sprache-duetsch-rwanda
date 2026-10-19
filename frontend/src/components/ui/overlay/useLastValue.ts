import { useRef } from 'react';

/** Keeps the last non-null value so an overlay can animate out with the content it was showing. */
export function useLastValue<T>(value: T | null | undefined): T | null {
  const last = useRef<T | null>(value ?? null);
  if (value !== null && value !== undefined) last.current = value;
  return value ?? last.current;
}
