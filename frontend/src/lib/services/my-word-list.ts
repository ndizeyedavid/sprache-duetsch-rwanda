import type { VocabWord } from '../../components/learn/types';
import { apiGet } from '../api';

export type WordListEntry = VocabWord & { lesson: { id: string; title: string; order: number } };

/** Every released lesson's vocabulary for a paid level, in course order. */
export const getMyWordList = (levelId: string) => apiGet<WordListEntry[]>(`/content/my/levels/${levelId}/words`);
