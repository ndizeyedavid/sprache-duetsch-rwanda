import type { AuthoredQuestion } from './types';
export function questionError(rows: AuthoredQuestion[]): string | null {
  for (const [index, q] of rows.entries()) {
    const prefix = `Question ${index + 1}: `;
    if (!q.prompt.trim()) return `${prefix}write the question.`;
    if (!Number.isFinite(q.points) || q.points <= 0 || q.points > 1000) return `${prefix}enter points between 0 and 1000.`;
    if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') {
      const choices = Array.isArray(q.options) ? q.options : [];
      if (choices.length < 2 || choices.some(v => typeof v !== 'string' || !v.trim()) || new Set(choices).size !== choices.length) return `${prefix}add at least two different, nonempty choices.`;
      const correct = Array.isArray(q.correctAnswer) ? q.correctAnswer : q.correctAnswer == null ? [] : [q.correctAnswer];
      if (!correct.length || correct.some(v => !choices.includes(v))) return `${prefix}mark the correct answer${q.type === 'MULTIPLE_CHOICE' ? 's' : ''}.`;
    }
    if (q.type === 'TRUE_FALSE' && q.correctAnswer == null) return `${prefix}choose True or False as the correct answer.`;
    if (q.type === 'FILL_BLANK' && (typeof q.correctAnswer !== 'string' || !q.correctAnswer.trim())) return `${prefix}enter the expected answer.`;
  }
  return null;
}
