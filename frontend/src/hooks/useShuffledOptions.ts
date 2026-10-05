import { useState } from 'react';
import { shuffleOptions } from '../lib/shuffle-options';

/** A fresh order per mounted attempt, stable through answering and background refetches. */
export function useShuffledOptions<T>(options: readonly T[], key: string) {
  const [seed] = useState(() => Math.floor(Math.random() * 4294967296));
  return shuffleOptions(options, seed, key);
}
