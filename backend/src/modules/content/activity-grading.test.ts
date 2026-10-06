import { describe,expect,it } from 'vitest';
import { gradeActivity } from './activity-grading.js';

describe('inline practice grading', () => {
  it('grades numeric choices and string choices consistently', () => {
    expect(gradeActivity('MCQ', '2', { correctIndex: 2 }).isCorrect).toBe(true);
    expect(gradeActivity('MCQ', 0, { correctIndex: 2 }).isCorrect).toBe(false);
    expect(gradeActivity('MCQ', '', { correctIndex: 0 }).isCorrect).toBe(false);
    expect(gradeActivity('MCQ', null, { correctIndex: 0 }).isCorrect).toBe(false);
  });
  it('does not assign a grade when an answer key is absent', () => {
    expect(gradeActivity('MCQ', 0, {}).auto).toBe(false);
    expect(gradeActivity('WRITING', 'My answer', {}).score).toBeNull();
  });
  it('normalizes fill-in answers without dropping umlauts', () => {
    expect(gradeActivity('FILL_BLANK', '  ÄPFEL ', { answer: 'Äpfel' }).isCorrect).toBe(true);
    expect(gradeActivity('FILL_BLANK', 'Apfel', { answer: 'Äpfel' }).isCorrect).toBe(false);
  });
  it('handles true/false and ordered sequences', () => {
    expect(gradeActivity('TRUE_FALSE', 'false', { correct: false }).isCorrect).toBe(true);
    expect(gradeActivity('ORDERING', ['ich', 'lerne'], { answer: ['ich', 'lerne'] }).isCorrect).toBe(true);
    expect(gradeActivity('ORDERING', ['lerne', 'ich'], { answer: ['ich', 'lerne'] }).isCorrect).toBe(false);
  });
});
