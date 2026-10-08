import type { IconType } from 'react-icons';
import { FiAward, FiEdit, FiZap } from 'react-icons/fi';
import type { Homework, Resource, RubricCriterion } from '../assignments/homework/types';
import type { AuthoredAssessment } from '../../lib/services';
import type { AuthoredQuestion } from '../questions/types';

/** One teacher-facing idea, three kinds. Homework uses the assignment engine; quizzes and tests use assessments. */
export type TaskKind = 'HOMEWORK' | 'QUIZ' | 'TEST';
export type TaskStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TestType = 'QUIZ' | 'MODULE_TEST' | 'FINAL_EXAM' | 'PLACEMENT';

export const KINDS: { kind: TaskKind; label: string; icon: IconType; hint: string }[] = [
  { kind: 'HOMEWORK', label: 'Homework', icon: FiEdit, hint: 'For a class. Writing, audio, files or questions. You mark it, and can ask for a revision.' },
  { kind: 'QUIZ', label: 'Quiz', icon: FiZap, hint: 'For a level. Questions marked automatically. Short, with optional timer.' },
  { kind: 'TEST', label: 'Test or exam', icon: FiAward, hint: 'For a level. Timed, limited attempts and a pass mark. Final exams count toward the certificate.' },
];
export const kindMeta = (kind: TaskKind) => KINDS.find(k => k.kind === kind)!;

export const TEST_TYPES: { value: Exclude<TestType, 'QUIZ'>; label: string; hint: string }[] = [
  { value: 'MODULE_TEST', label: 'Module test', hint: 'Checks one part of the course.' },
  { value: 'FINAL_EXAM', label: 'Final exam', hint: 'Students must pass it to get the level certificate.' },
  { value: 'PLACEMENT', label: 'Placement test', hint: 'Suggests the right level for new students.' },
];

export type TaskDraft = {
  kind: TaskKind; status: TaskStatus; title: string; instructions: string; questions: AuthoredQuestion[];
  classGroupId: string; levelId: string;
  // Homework
  homeworkMode: 'questions' | 'work'; responseType: 'TEXT' | 'FILE' | 'AUDIO' | 'MIXED'; estimatedMinutes: number; maxPoints: number;
  allowLate: boolean; maxSubmissions: number; resources: Resource[]; rubric: RubricCriterion[]; studentIds: string[];
  releaseAt: string | null; dueAt: string | null;
  // Quiz and test
  testType: TestType; durationMinutes: number | null; maxAttempts: number; passMark: number;
  availableFrom: string | null; availableUntil: string | null; protectedMode: boolean;
};

/** A row in the combined list, whichever engine it comes from. */
export type TaskItem = {
  key: string; source: 'homework' | 'assessment'; id: string; kind: TaskKind; title: string;
  scope: string; scopeId: string; status: TaskStatus; when: string | null; whenLabel: string;
  summary: string; toReview: number;
  homework?: Homework; assessment?: AuthoredAssessment;
};

export type TaskTarget = { kind: TaskKind; id?: string };
