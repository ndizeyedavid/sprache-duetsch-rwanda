import { expect,it } from 'vitest';
import { structureExercise } from './structured-exercises.js';
it('splits book prompts and aligns their labelled answer keys', () => {
  const result = structureExercise({ key: '1.1', prompt: 'Mark each vowel as long (L) or short (S): a) Vater b) Mann', modelAnswer: 'a) L b) S' });
  expect(result.items).toEqual([{ id: 'a', prompt: 'Vater', options: ['L', 'S'], answer: 'L' }, { id: 'b', prompt: 'Mann', options: ['L', 'S'], answer: 'S' }]);
});
it('does not treat variable sentence answers as a rigid answer key', () => {
  const result = structureExercise({ key: '2.1', prompt: 'Write: a) your sentence b) another sentence', modelAnswer: 'a) This is a model sentence. b) Another possible correct model sentence.' });
  expect(result.items?.every(item => item.answer === undefined)).toBe(true);
});
