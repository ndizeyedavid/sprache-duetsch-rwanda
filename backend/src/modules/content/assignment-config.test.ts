import { describe,expect,it } from 'vitest';
import { sanitizeActivityConfig } from './assignment-config.js';

const json = (value: unknown) => JSON.stringify(value);

describe('student activity config sanitizer', () => {
  it('removes answer keys at every nesting depth while preserving prompts and options', () => {
    expect(sanitizeActivityConfig({ answer: 'secret', items: [{ id: 'one', prompt: 'Hello', answer: 'Hallo', choices: ['Hallo', 'Danke'] }] }))
      .toEqual({ autoGraded: true, items: [{ id: 'one', prompt: 'Hello', choices: ['Hallo', 'Danke'] }] });
  });
  it('hides choice, true/false and multi-select keys', () => {
    expect(sanitizeActivityConfig({ question: 'Q', options: ['a', 'b'], correctIndex: 1 }, 'MCQ')).toEqual({ question: 'Q', options: ['a', 'b'], autoGraded: true });
    expect(sanitizeActivityConfig({ statement: 'S', correct: false }, 'TRUE_FALSE')).toEqual({ statement: 'S', autoGraded: true });
    expect(sanitizeActivityConfig({ question: 'Q', options: ['a', 'b'], correctIndices: [0] }, 'MULTIPLE_SELECT')).not.toHaveProperty('correctIndices');
  });
  it('hides blank answers in both single and sentence shapes', () => {
    expect(sanitizeActivityConfig({ text: 'Ich ___.', answer: ['komme', 'stamme'] }, 'FILL_BLANK')).toEqual({ text: 'Ich ___.', autoGraded: true });
    expect(sanitizeActivityConfig({ sentences: [{ text: 'Ich ___ aus Ruanda.', answer: 'komme' }] }, 'FILL_BLANK'))
      .toEqual({ sentences: [{ text: 'Ich ___ aus Ruanda.' }], autoGraded: true });
  });
  it('splits matching pairs into left items and shuffled right items', () => {
    const pairs = [{ left: 'Hallo', right: 'Muraho' }, { left: 'Danke', right: 'Murakoze' }, { left: 'Tschüss', right: 'Murabeho' }];
    const result = sanitizeActivityConfig({ pairs }, 'MATCHING', 'activity-1') as Record<string, unknown>;
    expect(result.pairs).toBeUndefined();
    expect(result.left).toEqual(['Hallo', 'Danke', 'Tschüss']);
    expect(result.right).not.toEqual(['Muraho', 'Murakoze', 'Murabeho']);
    expect([...(result.right as string[])].sort()).toEqual(['Murabeho', 'Muraho', 'Murakoze']);
    expect(sanitizeActivityConfig({ pairs }, 'MATCHING', 'activity-1')).toEqual(result);
  });
  it('shuffles ordering items and drops the legacy answer sequence', () => {
    const result = sanitizeActivityConfig({ items: ['Ich', 'lerne', 'Deutsch'] }, 'ORDERING', 'a') as Record<string, unknown>;
    expect(result.items).not.toEqual(['Ich', 'lerne', 'Deutsch']);
    const legacy = sanitizeActivityConfig({ options: ['lerne', 'Ich'], answer: ['Ich', 'lerne'] }, 'ORDERING', 'b') as Record<string, unknown>;
    expect(legacy).toEqual({ items: ['lerne', 'Ich'], autoGraded: true });
  });
  it('withholds listening transcripts, question keys and model answers until submission', () => {
    const listening = sanitizeActivityConfig({ audioUrl: '/api/uploads/a.mp3', transcript: 'Hallo!', questions: [{ prompt: 'Wer?', options: ['A', 'B'], correctIndex: 0 }] }, 'LISTENING');
    expect(json(listening)).not.toMatch(/transcript|correctIndex|Hallo!/);
    expect(listening).toMatchObject({ audioUrl: '/api/uploads/a.mp3', questions: [{ prompt: 'Wer?', options: ['A', 'B'] }], autoGraded: true });
    expect(sanitizeActivityConfig({ prompt: 'Schreib', minWords: 50, modelAnswer: 'Ich heiße…' }, 'WRITING')).toEqual({ prompt: 'Schreib', minWords: 50, autoGraded: false });
  });
  it('keeps flashcard backs and speaking prompts visible', () => {
    const cards = { cards: [{ front: 'der Hund', back: 'the dog', example: 'Der Hund bellt.' }] };
    expect(sanitizeActivityConfig(cards, 'FLASHCARD')).toEqual({ ...cards, autoGraded: true });
    expect(sanitizeActivityConfig({ text: 'Eichhörnchen', modelAudioUrl: '/api/uploads/m.mp3' }, 'PRONUNCIATION')).toMatchObject({ text: 'Eichhörnchen', modelAudioUrl: '/api/uploads/m.mp3' });
  });
  it('leaves structured self-study configs in their established shape', () => {
    const practice = { practiceMode: true, options: ['a', 'b'], correctIndex: 1, explanation: 'b', modelAnswer: 'b' };
    expect(sanitizeActivityConfig(practice, 'MCQ')).toEqual({ practiceMode: true, options: ['a', 'b'], autoGraded: true });
  });
});
