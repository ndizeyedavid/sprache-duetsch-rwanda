import type { Homework, HomeworkInput } from '../assignments/homework/types';
import type { AuthoredAssessment } from '../../lib/services';
import type { AuthoredQuestion } from '../questions/types';
import type { TaskDraft, TaskKind } from './task-types';

const sumPoints = (qs: AuthoredQuestion[]) => qs.reduce((t, q) => t + Number(q.points || 0), 0);

export function emptyDraft(kind: TaskKind, scope: { classGroupId?: string; levelId?: string } = {}): TaskDraft {
  return {
    kind, status: 'DRAFT', title: '', instructions: '', questions: [], classGroupId: scope.classGroupId ?? '', levelId: scope.levelId ?? '',
    homeworkMode: 'work', responseType: 'TEXT', estimatedMinutes: 20, maxPoints: 10, allowLate: true, maxSubmissions: 3,
    resources: [], rubric: [], studentIds: [], releaseAt: null, dueAt: null,
    testType: kind === 'QUIZ' ? 'QUIZ' : 'MODULE_TEST', durationMinutes: kind === 'TEST' ? 45 : null,
    maxAttempts: kind === 'QUIZ' ? 3 : 1, passMark: kind === 'QUIZ' ? 50 : 60,
    availableFrom: null, availableUntil: null, protectedMode: false,
  };
}

const fromQuestionRows = (rows: { points?: string | null; question?: unknown }[] | undefined): AuthoredQuestion[] =>
  (rows ?? []).flatMap(row => {
    const q = row.question as (AuthoredQuestion & { points: string | number }) | undefined;
    return q ? [{ ...q, points: Number(row.points ?? q.points), options: q.options ?? null, correctAnswer: q.correctAnswer ?? null, audioUrl: q.audioUrl ?? null, imageUrl: q.imageUrl ?? null }] : [];
  });

export function fromHomework(h: Homework): TaskDraft {
  const questions = fromQuestionRows(h.questions);
  return {
    ...emptyDraft('HOMEWORK'), status: h.status, title: h.title, instructions: h.instructions, questions, classGroupId: h.classGroupId,
    homeworkMode: questions.length ? 'questions' : 'work', responseType: h.responseType, estimatedMinutes: h.estimatedMinutes,
    maxPoints: Number(h.maxPoints), allowLate: h.allowLate, maxSubmissions: h.maxSubmissions, resources: h.resources ?? [],
    rubric: h.rubric ?? [], studentIds: h.recipients.map(r => r.studentId), releaseAt: h.releaseAt, dueAt: h.dueAt,
  };
}

export function fromAssessment(a: AuthoredAssessment): TaskDraft {
  const kind: TaskKind = a.type === 'QUIZ' ? 'QUIZ' : 'TEST';
  return {
    ...emptyDraft(kind), status: a.isPublished ? 'PUBLISHED' : 'DRAFT', title: a.title, instructions: a.description ?? '',
    questions: fromQuestionRows(a.questions), levelId: a.levelId, testType: a.type as TaskDraft['testType'],
    durationMinutes: a.durationMinutes, maxAttempts: a.maxAttempts ?? 1, passMark: Number(a.passMark ?? 50),
    availableFrom: a.availableFrom, availableUntil: a.availableUntil, protectedMode: a.protectedMode,
  };
}

export function toHomeworkInput(d: TaskDraft): HomeworkInput {
  const questions = d.homeworkMode === 'questions' ? d.questions : [];
  return {
    classGroupId: d.classGroupId, title: d.title.trim(), instructions: d.instructions.trim(), responseType: questions.length ? 'TEXT' : d.responseType,
    status: d.status, dueAt: d.dueAt, releaseAt: d.releaseAt, estimatedMinutes: d.estimatedMinutes,
    maxPoints: questions.length ? sumPoints(questions) : d.maxPoints, allowLate: d.allowLate, maxSubmissions: d.maxSubmissions,
    resources: d.resources, rubric: questions.length ? [] : d.rubric, studentIds: d.studentIds, questions,
  };
}

export function toAssessmentBody(d: TaskDraft): Record<string, unknown> {
  return {
    levelId: d.levelId, title: d.title.trim(), description: d.instructions.trim() || null, type: d.kind === 'QUIZ' ? 'QUIZ' : d.testType,
    durationMinutes: d.durationMinutes, maxAttempts: d.maxAttempts, passMark: d.passMark, isPublished: d.status === 'PUBLISHED',
    availableFrom: d.availableFrom, availableUntil: d.availableUntil, protectedMode: d.protectedMode, authoredQuestions: d.questions,
  };
}
