import { questionError } from '../questions/validate';
import type { TaskDraft } from './task-types';

export type StepId = 'basics' | 'content' | 'settings';
export type StepIssues = Record<StepId, string | null>;
export const STEPS: { id: StepId; label: string }[] = [{ id: 'basics', label: 'Basics' }, { id: 'content', label: 'Questions' }, { id: 'settings', label: 'Settings' }];

const after = (a: string | null, b: string | null) => !a || !b || new Date(b) > new Date(a);

/** First problem in each step, so the step bar can show what is left to do. */
export function stepIssues(d: TaskDraft): StepIssues {
  const homework = d.kind === 'HOMEWORK';
  const basics = !(homework ? d.classGroupId : d.levelId) ? `Choose a ${homework ? 'class' : 'level'}.`
    : d.title.trim().length < 3 ? 'Add a title (at least 3 characters).'
    : homework && d.instructions.trim().length < 10 ? 'Write instructions (at least 10 characters).' : null;
  const usesQuestions = !homework || d.homeworkMode === 'questions';
  const rubricTotal = d.rubric.reduce((t, r) => t + Number(r.points || 0), 0);
  const content = usesQuestions
    ? (!d.questions.length ? 'Add at least one question.' : questionError(d.questions))
    : d.rubric.length && Math.abs(rubricTotal - d.maxPoints) > 0.001 ? `Rubric points add up to ${rubricTotal}, but the task is worth ${d.maxPoints}.`
    : d.rubric.some(r => !r.title.trim()) ? 'Give every rubric criterion a name.' : null;
  const settings = homework
    ? (!after(d.releaseAt, d.dueAt) ? 'The due date must be after the release date.' : d.maxSubmissions < 1 || d.maxSubmissions > 20 ? 'Allow between 1 and 20 submissions.' : null)
    : (!after(d.availableFrom, d.availableUntil) ? 'The closing time must be after the opening time.'
      : d.maxAttempts < 1 ? 'Allow at least one attempt.' : d.passMark < 0 || d.passMark > 100 ? 'Set a pass mark between 0 and 100.'
      : d.durationMinutes !== null && d.durationMinutes < 1 ? 'Set a time limit of at least 1 minute, or turn it off.' : null);
  return { basics, content, settings };
}
