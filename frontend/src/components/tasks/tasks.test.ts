import { describe, expect, it } from 'vitest';
import { newQuestion } from '../questions/types';
import { questionIssue } from '../questions/validate';
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
