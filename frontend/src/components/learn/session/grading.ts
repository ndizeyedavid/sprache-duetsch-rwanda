import type { SessionItem } from '../types';
import { checkText,spokenMatch } from './normalize';

/** What the student gave for one question. */
export type Answer =
  | { kind: 'option'; value: string }
  | { kind: 'text'; value: string }
  /** Words in the order tapped; `picks` are their positions in the tile bank. */
  | { kind: 'tiles'; value: string[]; picks: number[] }
  | { kind: 'bool'; value: boolean }
  | { kind: 'speech'; value: string }
  | { kind: 'said' }
  | { kind: 'matched'; mistakes: number };

/** Result shown in the feedback bar: the right answer, its English meaning and audio. */
export type Verdict = {
  correct: boolean;
  /** The correct German/English to show (and play) after checking. */
  expected?: string;
  expectedLang?: 'de' | 'en';
  meaning?: string;
  note?: string;
  explanation?: string;
  audio?: string;
  audioText?: string;
};

const SPOKEN_PASS = 0.75;

const asString = (answer: Answer | null): string => {
  if (!answer) return '';
  if (answer.kind === 'tiles') return answer.value.join(' ');
  if (answer.kind === 'option' || answer.kind === 'text' || answer.kind === 'speech') return answer.value;
  return '';
};

export function isAnswered(answer: Answer | null): boolean {
  if (!answer) return false;
  if (answer.kind === 'bool' || answer.kind === 'said' || answer.kind === 'matched') return true;
  return asString(answer).trim() !== '';
}

export function gradeItem(item: SessionItem, answer: Answer | null): Verdict {
  const given = asString(answer);
  switch (item.kind) {
    case 'choose': {
      const correct = given === item.answer;
      const sentence = item.prompt?.includes('___') ? item.prompt.replace('___', item.answer) : item.answer;
      return { correct, expected: sentence, expectedLang: item.optionsLang, meaning: item.promptEn && item.optionsLang === 'de' ? item.promptEn : undefined,
        explanation: item.explanationEn, audio: item.answerAudio ?? item.audio, audioText: item.optionsLang === 'de' ? sentence : item.prompt };
    }
    case 'match':
      return { correct: answer?.kind === 'matched' && answer.mistakes === 0, note: answer?.kind === 'matched' && answer.mistakes ? 'All pairs found — try to match them without mistakes next time.' : undefined };
    case 'translate': {
      const lang = item.from === 'de' ? 'en' : 'de';
      const result = checkText(given, [item.answer, ...item.accepted], lang);
      return { correct: result.correct, expected: item.answer, expectedLang: lang, meaning: item.from === 'en' ? undefined : item.text, note: result.note,
        explanation: item.explanationEn, audio: item.from === 'de' ? item.audio : item.answerAudio, audioText: item.from === 'de' ? item.text : item.answer };
    }
    case 'order': {
      const result = checkText(given, [item.answer], 'de');
      return { correct: result.correct, expected: item.answer, expectedLang: 'de', meaning: item.en, note: result.note, audio: item.answerAudio, audioText: item.answer };
    }
    case 'fill': {
      const result = checkText(given, [item.answer, ...item.accepted], 'de');
      const sentence = item.text.replace('___', item.answer);
      return { correct: result.correct, expected: sentence, expectedLang: 'de', meaning: item.en, note: result.note, explanation: item.explanationEn, audio: item.answerAudio, audioText: sentence };
    }
    case 'listen': {
      const result = item.mode === 'choose' ? { correct: given === item.text } : checkText(given, [item.text], 'de');
      return { correct: result.correct, expected: item.text, expectedLang: 'de', meaning: item.en, note: 'note' in result ? result.note : undefined, audio: item.audio, audioText: item.text };
    }
    case 'speak': {
      const correct = answer?.kind === 'said' || (answer?.kind === 'speech' && spokenMatch(answer.value, item.text) >= SPOKEN_PASS);
      return { correct, expected: item.text, expectedLang: 'de', meaning: item.en, note: answer?.kind === 'speech' && !correct ? `We heard: “${answer.value}”` : undefined, audio: item.audio, audioText: item.text };
    }
    case 'truefalse': {
      const correct = answer?.kind === 'bool' && answer.value === item.answer;
      return { correct, expected: item.answer ? 'Richtig — true' : 'Falsch — false', expectedLang: 'en', meaning: `${item.statement} · ${item.statementEn}`, explanation: item.explanationEn, audio: item.audio, audioText: item.statement };
    }
  }
}
