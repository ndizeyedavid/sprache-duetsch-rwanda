import type { ReactNode } from 'react';
import type { Glossary,LessonTranslation } from '../types';
import { GlossaryContext } from './glossary-context';
import { LessonEnglishContext } from './lesson-english';

const NO_GLOSSARY: Glossary = {};

/** Makes an HTML lesson's English available to its text and activities (tap-to-translate and English lines). */
export function LessonEnglishProvider({ translation, level, children }: { translation?: LessonTranslation | null; level: string; children: ReactNode }) {
  return <GlossaryContext.Provider value={translation?.glossary ?? NO_GLOSSARY}>
    <LessonEnglishContext.Provider value={translation ? { lines: translation.lines, level } : null}>{children}</LessonEnglishContext.Provider>
  </GlossaryContext.Provider>;
}
