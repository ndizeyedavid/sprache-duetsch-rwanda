import type { Config } from './editor-config';
import { emptyQuestion,index,joinAlternatives,questionRows,rows,splitAlternatives,str,strings } from './editor-config';

/** Editable form of a saved config: canonical keys, legacy keys folded in, blank rows to start from. */
export function normalizeConfig(type: string, raw: Config): Config {
  const legacyQuestion = Array.isArray(raw.options) ? [{ prompt: str(raw.question ?? raw.prompt), options: strings(raw.options, ['', '']), correctIndex: index(raw.correctIndex ?? raw.answer) }] : [];
  switch (type) {
    case 'MCQ': return { question: str(raw.question ?? raw.prompt), options: strings(raw.options, ['', '', '', '']), correctIndex: index(raw.correctIndex ?? raw.answer) };
    case 'MULTIPLE_SELECT': return { question: str(raw.question ?? raw.prompt), options: strings(raw.options, ['', '', '', '']), correctIndices: (Array.isArray(raw.correctIndices ?? raw.answer) ? (raw.correctIndices ?? raw.answer) as unknown[] : []).map(v => index(v)) };
    case 'TRUE_FALSE': return { statement: str(raw.statement ?? raw.sentence ?? raw.prompt), correct: (raw.correct ?? raw.answer) !== false && str(raw.correct ?? raw.answer).toLowerCase() !== 'false' };
    case 'FILL_BLANK': {
      const sentences = Array.isArray(raw.sentences) ? rows(raw.sentences) : [{ text: raw.text ?? raw.sentence ?? '', answer: raw.answer ?? raw.correctAnswer }];
      return { sentences: sentences.map(row => ({ text: str(row.text), answer: joinAlternatives(row.answer ?? row.answers ?? row.correctAnswer) })) };
    }
    case 'MATCHING': {
      const pairs = Array.isArray(raw.pairs) ? rows(raw.pairs).map(row => ({ left: str(row.left), right: str(row.right) }))
        : Array.isArray(raw.left) && Array.isArray(raw.right) ? raw.left.map((left, i) => ({ left: str(left), right: str((raw.right as unknown[])[i]) })) : [];
      return { pairs: pairs.length ? pairs : [{ left: '', right: '' }, { left: '', right: '' }] };
    }
    case 'ORDERING': return { items: strings(raw.answer ?? raw.correctAnswer ?? raw.items, ['', '', '']) };
    case 'LISTENING':
    case 'READING': {
      const questions = Array.isArray(raw.questions) ? questionRows(raw.questions) : legacyQuestion;
      return { audioUrl: str(raw.audioUrl), transcript: str(raw.transcript), passage: str(raw.passage), questions: questions.length ? questions : [emptyQuestion()] };
    }
    case 'VOCABULARY':
    case 'FLASHCARD': {
      const cards = rows(raw.cards).map(card => ({ front: str(card.front), back: str(card.back), example: str(card.example), audioUrl: str(card.audioUrl) }));
      return { cards: cards.length ? cards : [{ front: '', back: '', example: '', audioUrl: '' }, { front: '', back: '', example: '', audioUrl: '' }] };
    }
    case 'DOCUMENT': return { prompt: str(raw.prompt), allowedTypes: str(raw.allowedTypes) || 'pdf,jpg,png' };
    case 'SPEAKING': return { prompt: str(raw.prompt), modelAudioUrl: str(raw.modelAudioUrl), maxSeconds: str(raw.maxSeconds) };
    case 'PRONUNCIATION': return { text: str(raw.text ?? raw.prompt), modelAudioUrl: str(raw.modelAudioUrl) };
    default: return { prompt: str(raw.prompt), minWords: str(raw.minWords), modelAnswer: str(raw.modelAnswer) };
  }
}

/** Keys the editors own; stale legacy copies are dropped on save, anything else is kept. */
const CONTENT_KEYS = ['question', 'options', 'correctIndex', 'correctIndices', 'statement', 'correct', 'answer', 'answers', 'correctAnswer', 'sentence', 'sentences', 'text',
  'pairs', 'left', 'right', 'items', 'correctOrder', 'audioUrl', 'transcript', 'passage', 'questions', 'cards', 'prompt', 'minWords', 'modelAnswer', 'allowedTypes',
  'isDocumentSubmission', 'modelAudioUrl', 'maxSeconds'];

const optional = (key: string, value: string) => (value.trim() ? { [key]: value.trim() } : {});
const positive = (key: string, value: unknown) => (Number(value) > 0 ? { [key]: Math.round(Number(value)) } : {});

/** The canonical config to store for an edited activity. */
export function savedConfig(type: string, original: Config, edited: Config): Config {
  const kept = Object.fromEntries(Object.entries(original).filter(([key]) => !CONTENT_KEYS.includes(key)));
  return { ...kept, ...canonical(type, edited) };
}

function canonical(type: string, c: Config): Config {
  switch (type) {
    case 'MCQ': return { question: str(c.question).trim(), options: strings(c.options, []).map(o => o.trim()), correctIndex: index(c.correctIndex) };
    case 'MULTIPLE_SELECT': return { question: str(c.question).trim(), options: strings(c.options, []).map(o => o.trim()), correctIndices: [...new Set((c.correctIndices as number[]) ?? [])].sort((a, b) => a - b) };
    case 'TRUE_FALSE': return { statement: str(c.statement).trim(), correct: c.correct === true };
    case 'FILL_BLANK': {
      const sentences = rows(c.sentences).map(row => { const answers = splitAlternatives(row.answer); return { text: str(row.text).trim(), answer: answers.length === 1 ? answers[0] : answers }; });
      return sentences.length === 1 ? sentences[0] : { sentences };
    }
    case 'MATCHING': return { pairs: rows(c.pairs).map(row => ({ left: str(row.left).trim(), right: str(row.right).trim() })) };
    case 'ORDERING': return { items: strings(c.items, []).map(item => item.trim()) };
    case 'LISTENING':
    case 'READING': return {
      ...(type === 'LISTENING' ? { audioUrl: str(c.audioUrl).trim(), ...optional('transcript', str(c.transcript)) } : { passage: str(c.passage).trim() }),
      questions: questionRows(c.questions).map(q => ({ prompt: q.prompt.trim(), options: q.options.map(o => o.trim()), correctIndex: q.correctIndex })),
    };
    case 'VOCABULARY':
    case 'FLASHCARD': return { cards: rows(c.cards).map(card => ({ front: str(card.front).trim(), back: str(card.back).trim(), ...optional('example', str(card.example)), ...optional('audioUrl', str(card.audioUrl)) })) };
    case 'DOCUMENT': return { prompt: str(c.prompt).trim(), allowedTypes: str(c.allowedTypes).trim(), isDocumentSubmission: true };
    case 'SPEAKING': return { prompt: str(c.prompt).trim(), ...optional('modelAudioUrl', str(c.modelAudioUrl)), ...positive('maxSeconds', c.maxSeconds) };
    case 'PRONUNCIATION': return { text: str(c.text).trim(), ...optional('modelAudioUrl', str(c.modelAudioUrl)) };
    default: return { prompt: str(c.prompt).trim(), ...positive('minWords', c.minWords), ...optional('modelAnswer', str(c.modelAnswer)) };
  }
}
