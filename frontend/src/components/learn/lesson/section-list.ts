import type { LessonContent } from '../types';

export type SectionId = 'goals' | 'words' | 'dialogue' | 'grammar' | 'phrases' | 'sounds' | 'reading';
export type SectionInfo = { id: SectionId; label: string; labelEn: string };

const ALL: SectionInfo[] = [
  { id: 'goals', label: 'Ziele', labelEn: 'Goals' },
  { id: 'words', label: 'Wörter', labelEn: 'Words' },
  { id: 'dialogue', label: 'Dialog', labelEn: 'Dialogue' },
  { id: 'grammar', label: 'Grammatik', labelEn: 'Grammar' },
  { id: 'phrases', label: 'Redemittel', labelEn: 'Phrases' },
  { id: 'sounds', label: 'Aussprache', labelEn: 'Sounds' },
  { id: 'reading', label: 'Lesen', labelEn: 'Reading' },
];

/** The lesson's reader pages, in teaching order: words and the dialogue before the rules. */
export function lessonSections(content: LessonContent): SectionInfo[] {
  const present: Record<SectionId, boolean> = {
    goals: true, words: content.vocab.length > 0, dialogue: !!content.dialogue, grammar: content.grammar.length > 0,
    phrases: content.phrases.length > 0, sounds: !!content.pronunciation, reading: !!content.reading,
  };
  return ALL.filter((section) => present[section.id]);
}
