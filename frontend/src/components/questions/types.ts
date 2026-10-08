export type AuthoredQuestion = {
  id: string; type: string; prompt: string; points: number; skill: string; difficulty: string;
  options: unknown; correctAnswer: unknown; audioUrl: string | null; imageUrl: string | null;
};

const defaults: Record<string, Pick<AuthoredQuestion, 'options' | 'correctAnswer' | 'points' | 'skill'>> = {
  SINGLE_CHOICE: { options: ['', ''], correctAnswer: null, points: 1, skill: 'VOCABULARY' },
  MULTIPLE_CHOICE: { options: ['', '', ''], correctAnswer: [], points: 2, skill: 'VOCABULARY' },
  TRUE_FALSE: { options: ['True', 'False'], correctAnswer: null, points: 1, skill: 'GRAMMAR' },
  FILL_BLANK: { options: null, correctAnswer: '', points: 1, skill: 'GRAMMAR' },
  MATCHING: { options: { left: ['', ''], right: ['', ''] }, correctAnswer: {}, points: 2, skill: 'VOCABULARY' },
  ORDERING: { options: ['', '', ''], correctAnswer: ['', '', ''], points: 2, skill: 'GRAMMAR' },
  SHORT_TEXT: { options: null, correctAnswer: null, points: 2, skill: 'WRITING' },
  ESSAY: { options: null, correctAnswer: null, points: 5, skill: 'WRITING' },
};

export const newQuestion = (type = 'SINGLE_CHOICE'): AuthoredQuestion => ({
  id: crypto.randomUUID(), type, prompt: '', difficulty: 'EASY', audioUrl: null, imageUrl: null,
  ...(defaults[type] ?? defaults.SINGLE_CHOICE),
});

/** Copy with a fresh id (and fresh nested arrays) so edits never leak between questions. */
export const copyQuestion = (q: AuthoredQuestion): AuthoredQuestion => ({ ...structuredClone(q), id: crypto.randomUUID() });
