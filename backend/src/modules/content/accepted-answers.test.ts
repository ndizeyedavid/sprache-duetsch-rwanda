import { describe,expect,it } from 'vitest';
import { matchesAlternative } from './accepted-answers.js';
import { gradeStructured } from './structured-grading.js';

describe('alternative answers for structured items', () => {
  it('accepts any listed alternative, ignoring case, ellipses and spacing', () => {
    expect(matchesAlternative('wenn', ['Falls', 'Wenn'])).toBe(true);
    expect(matchesAlternative('Werde  anrufen', ['werde anrufen', 'werde ... anrufen'])).toBe(true);
    expect(matchesAlternative('werde … anrufen.', ['werde anrufen'])).toBe(true);
    expect(matchesAlternative('werde, anrufen', ['werde ... anrufen'])).toBe(true);
  });
  it('rejects wrong, empty and malformed input', () => {
    expect(matchesAlternative('weil', ['Falls', 'Wenn'])).toBe(false);
    expect(matchesAlternative(' ... ', ['...'])).toBe(false);
    expect(matchesAlternative('wenn', 'wenn')).toBe(false);
    expect(matchesAlternative('wenn', undefined)).toBe(false);
  });
  it('grades items with alternatives and keeps the primary answer strict', () => {
    const items = [{ id: 'a', answer: 'Falls', answers: ['Falls', 'Wenn'] }, { id: 'b', answer: 'der' }];
    expect(gradeStructured({ a: 'wenn', b: 'Der' }, items)).toEqual({ isCorrect: true, score: 1, auto: true });
    expect(gradeStructured({ a: 'falls', b: 'der.' }, items)).toEqual({ isCorrect: false, score: 0.5, auto: true });
    expect(gradeStructured({ a: 'weil', b: 'der' }, items).isCorrect).toBe(false);
  });
});
