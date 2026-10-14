export type Config = Record<string, unknown>;
export type EditorProps = { type: string; config: Config; onChange: (config: Config) => void };

export const str = (value: unknown): string => typeof value === 'string' ? value : typeof value === 'number' ? String(value) : '';
export const rows = (value: unknown): Config[] => Array.isArray(value) ? value.map(row => row && typeof row === 'object' && !Array.isArray(row) ? row as Config : {}) : [];
export const strings = (value: unknown, fallback: string[]): string[] => Array.isArray(value) && value.length ? value.map(str) : fallback;
export const index = (value: unknown, fallback = 0): number => { const n = Number(value); return Number.isInteger(n) && n >= 0 ? n : fallback; };

/** Alternatives are edited as one text field separated by `|`. */
export const joinAlternatives = (value: unknown): string => Array.isArray(value) ? value.map(str).join(' | ') : str(value);
export const splitAlternatives = (value: unknown): string[] => str(value).split('|').map(part => part.trim()).filter(Boolean);

export type Question = { prompt: string; options: string[]; correctIndex: number };
export const emptyQuestion = (): Question => ({ prompt: '', options: ['', '', ''], correctIndex: 0 });
export const questionRows = (value: unknown): Question[] =>
  rows(value).map(row => ({ prompt: str(row.prompt ?? row.question), options: strings(row.options, ['', '']), correctIndex: index(row.correctIndex ?? row.answer) }));

/** Move one entry of a list (used by every repeatable editor row). */
export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
