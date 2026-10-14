import { describe,expect,it } from 'vitest';
import { normalizeConfig,savedConfig } from './config-model';
import { validateConfig } from './validate-config';

describe('activity editor config model', () => {
  it('folds legacy fill-in keys into canonical sentences and saves alternatives', () => {
    const edited = normalizeConfig('FILL_BLANK', { sentence: 'Ich ___ Deutsch.', answer: 'lerne', source: 'book' });
    expect(edited).toEqual({ sentences: [{ text: 'Ich ___ Deutsch.', answer: 'lerne' }] });
    const saved = savedConfig('FILL_BLANK', { sentence: 'old', answer: 'x', source: 'book' }, { sentences: [{ text: 'Ich ___ aus Ruanda.', answer: 'komme | stamme' }] });
    expect(saved).toEqual({ source: 'book', text: 'Ich ___ aus Ruanda.', answer: ['komme', 'stamme'] });
  });
  it('reads seeded matching pairs and legacy ordering answers', () => {
    expect(normalizeConfig('MATCHING', { pairs: [{ left: 'Hallo', right: 'Muraho' }] })).toEqual({ pairs: [{ left: 'Hallo', right: 'Muraho' }] });
    expect(normalizeConfig('ORDERING', { options: ['b', 'a'], answer: ['a', 'b'] })).toEqual({ items: ['a', 'b'] });
  });
  it('saves document submissions as flagged writing configs', () => {
    expect(savedConfig('DOCUMENT', {}, { prompt: ' Upload ', allowedTypes: 'pdf' })).toEqual({ prompt: 'Upload', allowedTypes: 'pdf', isDocumentSubmission: true });
  });
  it('explains what is missing before saving', () => {
    expect(validateConfig('MCQ', { question: 'Q', options: ['a', ''], correctIndex: 0 })).toMatch(/every answer/);
    expect(validateConfig('FILL_BLANK', { sentences: [{ text: 'no blank', answer: 'x' }] })).toMatch(/___/);
    expect(validateConfig('LISTENING', { audioUrl: '', questions: [] })).toMatch(/audio/);
    expect(validateConfig('FLASHCARD', { cards: [{ front: 'der Hund', back: 'the dog' }] })).toBeNull();
    expect(validateConfig('SPEAKING', { prompt: 'Sprich', maxSeconds: '2' })).toMatch(/between 5 and 600/);
  });
});
