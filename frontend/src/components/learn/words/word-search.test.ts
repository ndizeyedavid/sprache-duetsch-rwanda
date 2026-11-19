import { describe,expect,it } from 'vitest';
import type { WordListEntry } from '../../../lib/services/my-word-list';
import { byLesson,searchWords } from './word-search';

const lesson = (order: number) => ({ id: `l${order}`, title: `Lektion ${order}`, order });
const words: WordListEntry[] = [
  { de: 'der Tisch, -e', en: 'table', example: 'Der Tisch ist neu.', exampleEn: 'The table is new.', lesson: lesson(4) },
  { de: 'über', en: 'about; over', example: null, lesson: lesson(4) },
  { de: 'das Café, -s', en: 'café', lesson: lesson(9) },
];

describe('word list search', () => {
  it('finds words in German, English and examples, ignoring case and accents', () => {
    expect(searchWords(words, 'TABLE', '').map((word) => word.de)).toEqual(['der Tisch, -e']);
    expect(searchWords(words, 'uber', '').map((word) => word.de)).toEqual(['über']);
    expect(searchWords(words, 'cafe', '').map((word) => word.de)).toEqual(['das Café, -s']);
    expect(searchWords(words, 'is new', '').map((word) => word.de)).toEqual(['der Tisch, -e']);
    expect(searchWords(words, '', 'l9').map((word) => word.de)).toEqual(['das Café, -s']);
  });

  it('groups by lesson in course order', () => {
    expect(byLesson(words).map((group) => [group.lesson.order, group.words.length])).toEqual([[4, 2], [9, 1]]);
  });
});
