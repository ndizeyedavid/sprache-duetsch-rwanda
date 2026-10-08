import type { AuthoredQuestion } from './types';

const filled = (values: unknown[]) => values.every(v => typeof v === 'string' && v.trim());
const distinct = (values: unknown[]) => new Set(values.map(v => String(v).trim().toLowerCase())).size === values.length;

/** First problem in one question, written for the teacher, or null when it is ready. */
export function questionIssue(q: AuthoredQuestion): string | null {
  if (!q.prompt.trim()) return 'write the question.';
  if (!Number.isFinite(q.points) || q.points <= 0 || q.points > 1000) return 'enter points between 0 and 1000.';
  if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') {
    const choices = Array.isArray(q.options) ? q.options : [];
    if (choices.length < 2 || !filled(choices) || !distinct(choices)) return 'add at least two different choices.';
    const correct = Array.isArray(q.correctAnswer) ? q.correctAnswer : q.correctAnswer == null ? [] : [q.correctAnswer];
    if (!correct.length || correct.some(v => !choices.includes(v))) return `mark the correct answer${q.type === 'MULTIPLE_CHOICE' ? 's' : ''}.`;
  }
  if (q.type === 'TRUE_FALSE' && q.correctAnswer == null) return 'choose True or False.';
  if (q.type === 'FILL_BLANK' && (typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim())) return 'enter the expected answer.';
  if (q.type === 'MATCHING') {
    const left = (q.options as { left?: unknown[] } | null)?.left ?? [];
    const pairs = q.correctAnswer && typeof q.correctAnswer === 'object' ? Object.entries(q.correctAnswer as Record<string, unknown>) : [];
    if (left.length < 2 || pairs.length !== left.length || !filled(pairs.flat()) || !distinct(left)) return 'add at least two complete, different pairs.';
  }
  if (q.type === 'ORDERING') {
    const items = Array.isArray(q.options) ? q.options : [];
    if (items.length < 2 || !filled(items) || !distinct(items)) return 'add at least two different items.';
  }
  return null;
}

export function questionError(rows: AuthoredQuestion[]): string | null {
  for (const [index, q] of rows.entries()) {
    const issue = questionIssue(q);
    if (issue) return `Question ${index + 1}: ${issue}`;
  }
  return null;
}
