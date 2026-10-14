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
    expect(gradeActivity('FILL_BLANK', 'x', { text: 'Ich ___.' }).auto).toBe(false);
    expect(gradeActivity('LISTENING', [0], { audioUrl: '/a.mp3', questions: [{ prompt: 'Wer?' }] }).auto).toBe(false);
  });
  it('normalizes fill-in answers without dropping umlauts', () => {
    expect(gradeActivity('FILL_BLANK', '  ÄPFEL ', { answer: 'Äpfel' }).isCorrect).toBe(true);
    expect(gradeActivity('FILL_BLANK', 'Apfel', { answer: 'Äpfel' }).isCorrect).toBe(false);
  });
  it('handles true/false and ordered sequences', () => {
    expect(gradeActivity('TRUE_FALSE', 'false', { correct: false }).isCorrect).toBe(true);
    expect(gradeActivity('TRUE_FALSE', true, { statement: 'x', correct: false }).isCorrect).toBe(false);
    expect(gradeActivity('ORDERING', ['ich', 'lerne'], { answer: ['ich', 'lerne'] }).isCorrect).toBe(true);
    expect(gradeActivity('ORDERING', ['lerne', 'ich'], { answer: ['ich', 'lerne'] }).isCorrect).toBe(false);
  });
});

describe('fill in the blank', () => {
  it('accepts any listed alternative for a single blank', () => {
    const config = { text: 'Ich ___ aus Ruanda.', answer: ['komme', 'stamme'] };
    expect(gradeActivity('FILL_BLANK', 'Stamme', config).isCorrect).toBe(true);
    expect(gradeActivity('FILL_BLANK', ['komme'], config).isCorrect).toBe(true);
    expect(gradeActivity('FILL_BLANK', 'bin', config)).toMatchObject({ isCorrect: false, score: 0 });
  });
  it('grades the seeded multi-sentence shape with partial credit', () => {
    const seeded = { sentences: [{ text: 'Ich ___ aus Ruanda.', answer: 'komme' }] };
    expect(gradeActivity('FILL_BLANK', ['komme'], seeded)).toMatchObject({ isCorrect: true, score: 1, auto: true });
    const two = { sentences: [{ text: 'Ich ___ Nella.', answer: 'heiße' }, { text: 'Ich ___ 20.', answer: ['bin'] }] };
    expect(gradeActivity('FILL_BLANK', ['heiße', 'habe'], two)).toEqual({ isCorrect: false, score: 0.5, auto: true, results: [true, false] });
    expect(gradeActivity('FILL_BLANK', 'heiße\nbin', two).isCorrect).toBe(true);
    expect(gradeActivity('FILL_BLANK', '["heiße","bin"]', two).isCorrect).toBe(true);
  });
  it('keeps the legacy sentence/correctAnswer keys', () => {
    expect(gradeActivity('FILL_BLANK', 'lerne', { sentence: 'Ich ___ Deutsch.', correctAnswer: 'lerne' }).isCorrect).toBe(true);
  });
});

describe('matching', () => {
  const seeded = { pairs: [{ left: 'Hallo', right: 'Muraho' }, { left: 'Danke', right: 'Murakoze' }] };
  it('grades the seeded pairs shape from an aligned array', () => {
    expect(gradeActivity('MATCHING', ['Muraho', 'Murakoze'], seeded)).toMatchObject({ isCorrect: true, score: 1 });
    expect(gradeActivity('MATCHING', ['Muraho', 'Muraho'], seeded)).toMatchObject({ isCorrect: false, score: 0.5 });
  });
  it('accepts objects keyed by the left item or by index', () => {
    expect(gradeActivity('MATCHING', { Hallo: 'muraho', Danke: 'Murakoze' }, seeded).isCorrect).toBe(true);
    expect(gradeActivity('MATCHING', { 0: 'Muraho' }, seeded).score).toBe(0.5);
  });
  it('treats empty answers as wrong and missing pairs as manual', () => {
    expect(gradeActivity('MATCHING', [], seeded).score).toBe(0);
    expect(gradeActivity('MATCHING', ['x'], { pairs: [] }).auto).toBe(false);
  });
});

describe('ordering', () => {
  const config = { items: ['Ich', 'lerne', 'Deutsch'] };
  it('gives positional partial credit on the canonical items key', () => {
    expect(gradeActivity('ORDERING', ['Ich', 'lerne', 'Deutsch'], config)).toMatchObject({ isCorrect: true, score: 1 });
    expect(gradeActivity('ORDERING', ['Ich', 'Deutsch', 'lerne'], config)).toMatchObject({ isCorrect: false, score: 0.33 });
  });
  it('is never fully correct with the wrong number of items', () => {
    expect(gradeActivity('ORDERING', ['Ich', 'lerne', 'Deutsch', 'gern'], config).isCorrect).toBe(false);
    expect(gradeActivity('ORDERING', 'Ich lerne Deutsch', config).isCorrect).toBe(false);
  });
});

describe('choices and comprehension', () => {
  it('requires the exact set for multiple select', () => {
    const config = { options: ['a', 'b', 'c'], correctIndices: [0, 2] };
    expect(gradeActivity('MULTIPLE_SELECT', [2, 0], config).isCorrect).toBe(true);
    expect(gradeActivity('MULTIPLE_SELECT', '[0,2]', config).isCorrect).toBe(true);
    expect(gradeActivity('MULTIPLE_SELECT', [0], config).isCorrect).toBe(false);
    expect(gradeActivity('MULTIPLE_SELECT', [0, 1, 2], config).isCorrect).toBe(false);
  });
  it('grades listening and reading question sets with partial credit', () => {
    const questions = [{ prompt: 'Wo?', options: ['Kigali', 'Berlin'], correctIndex: 0 }, { prompt: 'Wann?', options: ['heute', 'morgen'], correctIndex: 1 }];
    expect(gradeActivity('LISTENING', [0, 1], { audioUrl: '/a.mp3', questions })).toMatchObject({ isCorrect: true, score: 1 });
    expect(gradeActivity('READING', [0, 0], { passage: 'Text', questions })).toMatchObject({ isCorrect: false, score: 0.5 });
    expect(gradeActivity('READING', { 1: 1 }, { passage: 'Text', questions }).score).toBe(0.5);
  });
  it('keeps the legacy single listening question', () => {
    expect(gradeActivity('LISTENING', 1, { question: 'Wer?', options: ['A', 'B'], correctIndex: 1 }).isCorrect).toBe(true);
    expect(gradeActivity('LISTENING', '0', { question: 'Wer?', options: ['A', 'B'], correctIndex: 1 }).isCorrect).toBe(false);
  });
});

describe('completion and manual types', () => {
  it('marks vocabulary and flashcards complete without right or wrong', () => {
    const cards = { cards: [{ front: 'der Hund', back: 'the dog' }] };
    expect(gradeActivity('FLASHCARD', { reviewed: 1 }, cards)).toEqual({ isCorrect: null, score: 1, auto: true });
    expect(gradeActivity('VOCABULARY', null, cards).auto).toBe(true);
  });
  it('leaves writing, speaking and pronunciation to the teacher', () => {
    for (const type of ['WRITING', 'SPEAKING', 'PRONUNCIATION']) {
      expect(gradeActivity(type, { fileUrl: '/api/uploads/x.webm' }, { prompt: 'Sprich', modelAnswer: 'x' }).auto).toBe(false);
    }
  });
  it('still routes structured self-study items to the structured grader', () => {
    const config = { practiceMode: true, items: [{ id: 'a', answer: 'L' }, { id: 'b', answer: 'S' }] };
    expect(gradeActivity('WRITING', { a: 'L', b: 'L' }, config)).toEqual({ isCorrect: false, score: 0.5, auto: true });
    expect(gradeActivity('MCQ', 1, { practiceMode: true, options: ['a', 'b'], correctIndex: 1 }).isCorrect).toBe(true);
  });
});
