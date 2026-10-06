import { describe,expect,it } from 'vitest';
import { gradeStructured } from './structured-grading.js';

describe('structured course exercises', () => {
  const items = [{ id: 'a', answer: 'L' }, { id: 'b', answer: 'S' }];
  it('grades every item and gives partial credit', () => {
    expect(gradeStructured({ a: 'L', b: 'L' }, items)).toEqual({ isCorrect: false, score: 0.5, auto: true });
    expect(gradeStructured({ a: 'L', b: 'S' }, items).isCorrect).toBe(true);
    expect(gradeStructured('a', items).isCorrect).toBe(false);
  });
  it('keeps open-ended responses ungraded', () => {
    expect(gradeStructured({ a: 'My name' }, [{ id: 'a' }]).auto).toBe(false);
  });
});
