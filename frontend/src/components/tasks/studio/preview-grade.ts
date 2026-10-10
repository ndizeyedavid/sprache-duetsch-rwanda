import { questionMeta } from '../../questions/question-meta';
import type { AuthoredQuestion } from '../../questions/types';

/** Same comparison the server uses: trimmed, case-insensitive; order matters only for ordering questions. */
const canon = (v: unknown): string => typeof v === 'string' ? v.trim().toLowerCase() : v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
const asList = (v: unknown): string[] => Array.isArray(v) ? v.map(canon)
  : v && typeof v === 'object' ? Object.entries(v as Record<string, unknown>).map(([k, val]) => `${k.trim().toLowerCase()}:${canon(val)}`)
  : v == null ? [] : [canon(v)];

export type PreviewResult = 'correct' | 'wrong' | 'manual' | 'blank';

export function previewResult(q: AuthoredQuestion, response: unknown): PreviewResult {
  if (!questionMeta(q.type).auto) return 'manual';
  const given = asList(response);
  if (!given.length || given.every(v => !v)) return 'blank';
  const expected = asList(q.correctAnswer);
  if (q.type === 'ORDERING') return given.length === expected.length && given.every((v, i) => v === expected[i]) ? 'correct' : 'wrong';
  const a = [...given].sort(), b = [...expected].sort();
  return a.length === b.length && a.every((v, i) => v === b[i]) ? 'correct' : 'wrong';
}
