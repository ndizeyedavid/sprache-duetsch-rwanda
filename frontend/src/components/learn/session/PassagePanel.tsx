import { FiBookOpen,FiHeadphones } from 'react-icons/fi';
import { DialogueSection } from '../lesson/DialogueSection';
import { ReadingSection } from '../lesson/ReadingSection';
import type { LessonContent } from '../types';

/** The text a reading/listening session asks about, folded away so the question stays in view. */
export function PassagePanel({ passage, content }: { passage: 'reading' | 'dialogue'; content: LessonContent | null }) {
  if (!content || (passage === 'reading' && !content.reading) || (passage === 'dialogue' && !content.dialogue)) return null;
  const Icon = passage === 'reading' ? FiBookOpen : FiHeadphones;
  return <details className="group rounded-box border border-line bg-base-100" open>
    <summary className="flex cursor-pointer list-none items-center gap-2 p-3 text-sm font-semibold">
      <Icon aria-hidden className="text-primary" />
      {passage === 'reading' ? 'Read the text' : 'Listen to the dialogue'}
      <span className="ml-auto text-xs font-normal text-muted group-open:hidden">Show</span>
      <span className="ml-auto hidden text-xs font-normal text-muted group-open:inline">Hide</span>
    </summary>
    <div className="max-h-[22rem] overflow-y-auto border-t border-line p-3">
      {passage === 'reading' ? <ReadingSection content={content} /> : <DialogueSection content={content} />}
    </div>
  </details>;
}
