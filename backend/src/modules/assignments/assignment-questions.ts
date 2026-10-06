import type { Prisma } from '../../generated/prisma/client.js';
import { badRequest,conflict } from '../../lib/http-error.js';
import type { SnapshotQuestion } from '../assessments/attempt-snapshot.js';
import { publicSnapshot,readSnapshot } from '../assessments/attempt-snapshot.js';
import type { AuthoredQuestion } from '../assessments/authored-question.schema.js';
import { gradeObjectiveAnswer } from '../assessments/grade-objective-answer.js';
import { isObjectiveQuestionType } from '../assessments/is-objective-question-type.js';

export const assignmentQuestions = (value: Prisma.JsonValue): SnapshotQuestion[] => readSnapshot(value) ?? [];
export const publicQuestions = (value: Prisma.JsonValue) => publicSnapshot(assignmentQuestions(value));

export function prepareQuestions(rows: AuthoredQuestion[]): SnapshotQuestion[] {
  return rows.map((q, order) => ({ id: q.id, order, points: null, question: { ...q, points: String(q.points) } }));
}

export function validateQuestionWork(questions: SnapshotQuestion[], responses: Record<string, unknown>, submit: boolean): void {
  if (Object.keys(responses).some(id => !questions.some(q => q.question.id === id))) throw badRequest('An answer does not belong to this assignment');
  if (!submit) return;
  for (const { question: q } of questions) {
    const answer = responses[q.id];
    const missing = answer == null || typeof answer === 'string' && !answer.trim() || Array.isArray(answer) && !answer.length || typeof answer === 'object' && !Object.keys(answer).length;
    if (missing) throw badRequest('Answer every question before submitting');
    if (['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE'].includes(q.type)) {
      const options = q.type === 'TRUE_FALSE' ? ['True', 'False'] : Array.isArray(q.options) ? q.options : [];
      const values = Array.isArray(answer) ? answer : [answer];
      if (values.some(v => !options.includes(v)) || q.type !== 'MULTIPLE_CHOICE' && Array.isArray(answer)) throw badRequest('Choose a valid answer');
    }
    if (['FILL_BLANK', 'SHORT_TEXT', 'ESSAY'].includes(q.type) && typeof answer !== 'string') throw badRequest('Use text for written answers');
  }
}

export function suggestedScores(questions: SnapshotQuestion[], responses: Record<string, unknown>): (number | null)[] {
  return questions.map(({ question: q, points }) => isObjectiveQuestionType(q.type)
    ? gradeObjectiveAnswer(q.type, responses[q.id], q.correctAnswer) ? Number(points ?? q.points) : 0 : null);
}

export function checkQuestionScores(questions: SnapshotQuestion[], scores: number[]): number {
  if (scores.length !== questions.length || scores.some((v, i) => v > Number(questions[i].points ?? questions[i].question.points))) throw badRequest('Score every question within its point limit');
  return scores.reduce((sum, v) => sum + v, 0);
}

export function assertQuestionsUnchanged(previous: Prisma.JsonValue, questions: SnapshotQuestion[]): void {
  const signature = (rows: SnapshotQuestion[]) => rows.map(({ question: q, points }) => [q.id, q.type, q.prompt, Number(points ?? q.points), q.options, q.correctAnswer, q.audioUrl, q.imageUrl, q.skill, q.difficulty]);
  if (JSON.stringify(signature(assignmentQuestions(previous))) !== JSON.stringify(signature(questions))) throw conflict('Questions stay fixed after a submission');
}
