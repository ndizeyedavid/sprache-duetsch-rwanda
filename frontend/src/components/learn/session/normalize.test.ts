import { describe,expect,it } from 'vitest';
import { gradeItem } from './grading';
import { checkText,spokenMatch } from './normalize';

describe('checkText', () => {
  it('ignores case, punctuation and English contractions', () => {
    expect(checkText("i'm from rwanda", ['I am from Rwanda.'], 'en').correct).toBe(true);
    expect(checkText('Where are you from', ['Where are you from?'], 'en').correct).toBe(true);
  });

  it('forgives one letter in a longer English word, with a note', () => {
    const result = checkText('I speak three langauges', ['I speak three languages.'], 'en');
    expect(result.correct).toBe(true);
    expect(result.note).toContain('languages');
  });

  it('keeps German strict: a wrong ending is wrong', () => {
    expect(checkText('Woher kommt du?', ['Woher kommst du?'], 'de').correct).toBe(false);
    expect(checkText('ich heisst Amina', ['Ich heiße Amina.'], 'de').correct).toBe(false);
  });

  it('accepts ae/oe/ue/ss for ä/ö/ü/ß and says so', () => {
    const result = checkText('Ich heisse Amina', ['Ich heiße Amina.'], 'de');
    expect(result.correct).toBe(true);
    expect(result.note).toContain('heiße');
  });

  it('accepts listed alternatives', () => {
    expect(checkText('Mein Name ist Tom', ['Ich heiße Tom.', 'Mein Name ist Tom.'], 'de').correct).toBe(true);
  });
});

describe('spokenMatch', () => {
  it('scores the share of target words heard', () => {
    expect(spokenMatch('ich komme aus Ruanda', 'Ich komme aus Ruanda.')).toBe(1);
    expect(spokenMatch('ich komme', 'Ich komme aus Ruanda.')).toBe(0.5);
  });
});

describe('gradeItem', () => {
  it('rebuilds the full sentence for a gap and checks typed answers', () => {
    const item = { id: 'f', kind: 'fill' as const, text: '___ heißt du?', answer: 'Wie', accepted: [], en: 'What is your name?' };
    const verdict = gradeItem(item, { kind: 'text', value: 'wie' });
    expect(verdict.correct).toBe(true);
    expect(verdict.expected).toBe('Wie heißt du?');
  });

  it('builds tile answers in order', () => {
    const item = { id: 't', kind: 'translate' as const, from: 'en' as const, text: 'I live in Kigali.', answer: 'Ich wohne in Kigali.', accepted: [], tiles: [] };
    expect(gradeItem(item, { kind: 'tiles', value: ['Ich', 'wohne', 'in', 'Kigali'], picks: [0, 1, 2, 3] }).correct).toBe(true);
    expect(gradeItem(item, { kind: 'tiles', value: ['Ich', 'in', 'wohne', 'Kigali'], picks: [0, 2, 1, 3] }).correct).toBe(false);
  });

  it('counts a matching set as right only without mistakes', () => {
    const item = { id: 'm', kind: 'match' as const, pairs: [['a', 'b']] as [string, string][], pairAudio: [] };
    expect(gradeItem(item, { kind: 'matched', mistakes: 0 }).correct).toBe(true);
    expect(gradeItem(item, { kind: 'matched', mistakes: 2 }).correct).toBe(false);
  });
});
