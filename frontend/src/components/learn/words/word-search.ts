import type { WordListEntry } from '../../../lib/services/my-word-list';

/** Lower-case, accent-free text so "uber" finds "über" and "cafe" finds "Café". */
export const plain = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Words matching the search in German, English or the example, optionally from one lesson only. */
export function searchWords(words: WordListEntry[], query: string, lessonId: string): WordListEntry[] {
  const needle = plain(query.trim());
  return words.filter((word) => (!lessonId || word.lesson.id === lessonId)
    && (!needle || [word.de, word.en, word.example ?? '', word.exampleEn ?? ''].some((text) => plain(text).includes(needle))));
}

/** Matching words grouped by lesson, in course order. */
export function byLesson(words: WordListEntry[]): { lesson: WordListEntry['lesson']; words: WordListEntry[] }[] {
  const groups = new Map<string, { lesson: WordListEntry['lesson']; words: WordListEntry[] }>();
  for (const word of words) {
    const group = groups.get(word.lesson.id) ?? { lesson: word.lesson, words: [] };
    group.words.push(word);
    groups.set(word.lesson.id, group);
  }
  return [...groups.values()];
}
