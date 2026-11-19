import { createContext,useContext } from 'react';

/** English for an HTML lesson's activity text (Lesson.translation.lines) and the level for "Show English". */
export type LessonEnglish = { lines: Record<string, string>; level: string };

export const LessonEnglishContext = createContext<LessonEnglish | null>(null);

export const useLessonEnglish = () => useContext(LessonEnglishContext);
