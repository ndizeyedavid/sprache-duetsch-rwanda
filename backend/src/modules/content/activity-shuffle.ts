/** FNV-1a hash used to seed a deterministic shuffle. */
const hash = (seed: string): number => {
  let state = 2166136261;
  for (const character of seed) state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  return state;
};

/**
 * Stable shuffle for answer-revealing order (matching right-hand sides, ordering
 * items). The same seed always gives the same order, and the result never equals
 * the original order when a different arrangement exists.
 */
export function stableShuffle<T>(values: readonly T[], seed: string): T[] {
  let state = hash(seed);
  const result = [...values];
  for (let i = result.length - 1; i > 0; i -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  const same = (list: T[]) => list.every((value, index) => JSON.stringify(value) === JSON.stringify(values[index]));
  if (same(result) && values.length > 1) {
    const rotated = [...result.slice(1), result[0]];
    if (!same(rotated)) return rotated;
  }
  return result;
}
