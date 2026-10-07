export type AuthoredQuestion = {
  id: string; type: string; prompt: string; points: number; skill: string; difficulty: string;
  options: unknown; correctAnswer: unknown; audioUrl: string | null; imageUrl: string | null;
};
export const newQuestion = (type = 'SINGLE_CHOICE'): AuthoredQuestion => ({ id: crypto.randomUUID(), type, prompt: '', points: 1, skill: 'VOCABULARY', difficulty: 'EASY', options: type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE' ? ['', ''] : null, correctAnswer: null, audioUrl: null, imageUrl: null });
export const questionTypes = [ ['SINGLE_CHOICE', 'Multiple choice · one answer'], ['MULTIPLE_CHOICE', 'Multiple choice · several answers'], ['TRUE_FALSE', 'True or false'], ['FILL_BLANK', 'Fill in the blank'], ['SHORT_TEXT', 'Short written answer'], ['ESSAY', 'Long written answer'] ];
