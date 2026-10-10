/** Shuffle presentation while preserving each option's original grading index. */
export function shuffleOptions<T>(options: readonly T[], seed: number, key: string) {
  let state = seed >>> 0;
  for (const character of key) state = Math.imul(state ^ character.charCodeAt(0), 16777619) >>> 0;
  const result = options.map((value, index) => ({ value, index }));
  for (let i = result.length - 1; i > 0; i -= 1) {
    state = (state + 0x6D2B79F5) >>> 0;
    let random = Math.imul(state ^ (state >>> 15), state | 1);
    random ^= random + Math.imul(random ^ (random >>> 7), random | 61);
    const j = Math.floor(((random ^ (random >>> 14)) >>> 0) / 4294967296 * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
