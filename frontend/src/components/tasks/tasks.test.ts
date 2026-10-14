import { describe, expect, it } from 'vitest';
import { newQuestion } from '../questions/types';
import { questionIssue } from '../questions/validate';
import { latePolicyLabel, lateDuration, scoreAfterPenalty } from '../assignments/homework/late-policy';
import { previewResult } from './studio/preview-grade';
import { emptyDraft, toAssessmentBody, toHomeworkInput } from './task-draft';
import { stepIssues } from './task-validation';

const tf = { ...newQuestion('TRUE_FALSE'), prompt: 'Berlin is in Germany.', correctAnswer: 'True' };
const match = { ...newQuestion('MATCHING'), prompt: 'Match.', options: { left: ['eins', 'zwei'], right: ['1', '2'] }, correctAnswer: { eins: '1', zwei: '2' } };
const order = { ...newQuestion('ORDERING'), prompt: 'Order.', options: ['a', 'b', 'c'], correctAnswer: ['a', 'b', 'c'] };

describe('task drafts', () => {
  it('turns a quiz draft into an assessment body', () => {
    const d = { ...emptyDraft('QUIZ', { levelId: 'L1' }), title: ' Quiz ', questions: [tf], status: 'PUBLISHED' as const };
    expect(toAssessmentBody(d)).toMatchObject({ levelId: 'L1', title: 'Quiz', type: 'QUIZ', isPublished: true, maxAttempts: 3, authoredQuestions: [tf] });
  });
  it('turns question homework into homework with points from its questions', () => {
    const d = { ...emptyDraft('HOMEWORK', { classGroupId: 'C1' }), title: 'HW', instructions: 'Answer all questions.', homeworkMode: 'questions' as const, questions: [tf, match] };
    expect(toHomeworkInput(d)).toMatchObject({ classGroupId: 'C1', maxPoints: 3, rubric: [], responseType: 'TEXT' });
  });
  it('keeps the late policy and lesson link when saving homework, and checks penalty ranges', () => {
    const d = { ...emptyDraft('HOMEWORK', { classGroupId: 'C1' }), title: 'HW', instructions: 'Write about Kigali.', lessonId: 'L9', gracePeriodMinutes: 15, latePenaltyPercentPerDay: 10, latePenaltyMaxPercent: 30 };
    expect(toHomeworkInput(d)).toMatchObject({ lessonId: 'L9', gracePeriodMinutes: 15, latePenaltyPercentPerDay: 10, latePenaltyMaxPercent: 30 });
    expect(stepIssues({ ...d, latePenaltyPercentPerDay: 120 }).settings).toMatch(/0% and 100%/);
    expect(stepIssues({ ...d, allowLate: false, latePenaltyPercentPerDay: 120 }).settings).toBeNull();
  });
  it('describes late policies and previews the penalised score like the server', () => {
    const policy = { allowLate: true, gracePeriodMinutes: 15, latePenaltyPercentPerDay: '10', latePenaltyMaxPercent: '30' };
    expect(latePolicyLabel(policy)).toBe('Accepted with 10% off per late day (max 30%) after 15 min grace');
    expect(latePolicyLabel({ ...policy, latePenaltyPercentPerDay: 0, gracePeriodMinutes: 0 })).toBe('Accepted, marked as late');
    expect(latePolicyLabel({ ...policy, allowLate: false })).toBe('Not accepted after the deadline');
    expect(lateDuration(1530)).toBe('1 d 1 h');
    expect(scoreAfterPenalty(8.33, 15)).toBe(7.08);
  });
  it('reports what is missing in each step', () => {
    expect(stepIssues(emptyDraft('TEST'))).toEqual({ basics: 'Choose a level.', content: 'Add at least one question.', settings: null });
    const ready = { ...emptyDraft('TEST', { levelId: 'L1' }), title: 'Unit test', questions: [tf] };
    expect(stepIssues(ready)).toEqual({ basics: null, content: null, settings: null });
  });
});

describe('questions', () => {
  it('accepts complete matching and ordering questions and rejects half-filled ones', () => {
    expect(questionIssue(match)).toBeNull();
    expect(questionIssue(order)).toBeNull();
    expect(questionIssue({ ...match, correctAnswer: { eins: '1', zwei: '' } })).toMatch(/pairs/);
    expect(questionIssue({ ...order, options: ['a', ''] })).toMatch(/items/);
  });
  it('marks preview answers the same way the server does', () => {
    expect(previewResult(tf, 'true')).toBe('correct');
    expect(previewResult(match, { eins: '1', zwei: '2' })).toBe('correct');
    expect(previewResult(order, ['b', 'a', 'c'])).toBe('wrong');
    expect(previewResult({ ...newQuestion('ESSAY'), prompt: 'Write.' }, 'text')).toBe('manual');
  });
});
