import { gradeStructured } from "./structured-grading.js";
const canon = (value: unknown): string => {
  if (typeof value === 'string') return value.trim().toLowerCase();
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};
const sameSequence = (a: string[], b: string[]): boolean => a.length === b.length && a.every((v, i) => v === b[i]);

export function gradeActivity(type: string, response: unknown, config: Record<string, unknown>): { isCorrect: boolean | null; score: number | null; auto: boolean } {
  const cfg = config;
  if (cfg.practiceMode === true && Array.isArray(cfg.items)) return gradeStructured(response, cfg.items);
  if (type === 'FILL_BLANK') {
    const expected = (cfg.answer as string) ?? (cfg.correctAnswer as string) ?? '';
    if (!expected) return { isCorrect: null, score: null, auto: false };
    const ok = canon(response) === canon(expected);
    return { isCorrect: ok, score: ok ? 1 : 0, auto: true };
  }
  if (type === 'TRUE_FALSE') {
    const expected = cfg.correct ?? cfg.answer;
    if (expected === undefined) return { isCorrect: null, score: null, auto: false };
    const ok = canon(response) === canon(expected);
    return { isCorrect: ok, score: ok ? 1 : 0, auto: true };
  }
  if (type === 'MULTIPLE_SELECT') {
    const expected = cfg.correctIndices ?? cfg.answer;
    if (!Array.isArray(expected)) return { isCorrect: null, score: null, auto: false };
    const given = Array.isArray(response) ? response.map(Number).sort((a, b) => a - b) : [];
    const correct = expected.map(Number).sort((a, b) => a - b);
    const ok = given.length === correct.length && given.every((v, i) => v === correct[i]);
    return { isCorrect: ok, score: ok ? 1 : 0, auto: true };
  }
  if (type === 'MCQ') {
    const expected = Number(cfg.correctIndex ?? cfg.answer ?? -1);
    if (!Number.isFinite(expected) || expected < 0) return { isCorrect: null, score: null, auto: false };
    const given = typeof response === 'number' || (typeof response === 'string' && response.trim() !== '') ? Number(response) : NaN;
    const ok = given === expected;
    return { isCorrect: ok, score: ok ? 1 : 0, auto: true };
  }
  if (type === 'ORDERING') {
    const expected = Array.isArray(cfg.answer) ? (cfg.answer as unknown[]) : Array.isArray((cfg).correctAnswer) ? ((cfg).correctAnswer as unknown[]) : null;
    const given = Array.isArray(response) ? (response as unknown[]).map(canon) : [];
    if (!expected) return { isCorrect: null, score: null, auto: false };
    const exp = (expected).map(canon);
    const ok = sameSequence(given, exp);
    return { isCorrect: ok, score: ok ? 1 : 0, auto: true };
  }
  if (type === 'LISTENING') {
    const expected = Number(cfg.correctIndex ?? cfg.answer ?? -1);
    if (Number.isFinite(expected) && expected >= 0) {
      const ok = Number(response) === expected;
      return { isCorrect: ok, score: ok ? 1 : 0, auto: true };
    }
    return { isCorrect: null, score: null, auto: false };
  }
  // WRITING, DOCUMENT, others -> manual grading required
  return { isCorrect: null, score: null, auto: false };
}

