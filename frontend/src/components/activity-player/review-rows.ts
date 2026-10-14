import { blankSentences,choiceQuestions,matchingSides,text } from './config-readers';
import type { ActivityConfig,ActivityReview } from './types';

export type ReviewRow = { label: string; given: string; expected?: string; correct: boolean | null };

const list = (value: unknown): unknown[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim().startsWith('[')) { try { const parsed: unknown = JSON.parse(value); return Array.isArray(parsed) ? parsed : []; } catch { return []; } }
  return [value];
};
const index = (value: unknown): number | null => {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Number(value) : NaN;
  return Number.isInteger(parsed) ? parsed : null;
};
const option = (options: string[], value: unknown) => { const i = index(value); return i !== null ? options[i] ?? '—' : '—'; };
const answerOf = (value: unknown) => text(value).trim() || '—';
const yesNo = (value: unknown) => value === true || value === 'true' ? 'True' : value === false || value === 'false' ? 'False' : '—';

/** Your answer next to the correct one, one row per part, for the post-submission review. */
export function reviewRows(type: string, config: ActivityConfig, response: unknown, review: ActivityReview): ReviewRow[] {
  const results = review.results ?? [];
  const at = (i: number) => results[i] ?? null;
  switch (type) {
    case 'MCQ': {
      const q = choiceQuestions(config)[0] ?? { prompt: '', options: [] };
      return [{ label: q.prompt || 'Your answer', given: option(q.options, response), expected: review.correctIndex != null ? q.options[review.correctIndex] : undefined, correct: at(0) }];
    }
    case 'MULTIPLE_SELECT': {
      const q = choiceQuestions(config)[0] ?? { prompt: '', options: [] };
      const names = (values: unknown[]) => values.map(v => option(q.options, v)).join(', ') || '—';
      return [{ label: q.prompt || 'Your answer', given: names(list(response)), expected: review.correctIndices ? names(review.correctIndices) : undefined, correct: at(0) }];
    }
    case 'TRUE_FALSE':
      return [{ label: text(config.statement) || 'Statement', given: yesNo(response), expected: review.correct != null ? yesNo(review.correct) : undefined, correct: at(0) }];
    case 'LISTENING':
    case 'READING':
      return choiceQuestions(config).map((q, i) => ({ label: q.prompt || `Question ${i + 1}`, given: option(q.options, list(response)[i]), expected: review.correctIndices?.[i] != null ? q.options[review.correctIndices[i]!] : undefined, correct: at(i) }));
    case 'FILL_BLANK':
      return blankSentences(config).map((sentence, i) => ({ label: sentence || `Blank ${i + 1}`, given: answerOf(list(response)[i]), expected: review.blanks?.[i]?.join(' / '), correct: at(i) }));
    case 'MATCHING':
      return matchingSides(config).left.map((left, i) => ({ label: left, given: answerOf(list(response)[i]), expected: review.pairs?.[i]?.right, correct: at(i) }));
    case 'ORDERING':
      return (review.order ?? []).map((item, i) => ({ label: `Position ${i + 1}`, given: answerOf(list(response)[i]), expected: item, correct: at(i) }));
    default: return [];
  }
}
