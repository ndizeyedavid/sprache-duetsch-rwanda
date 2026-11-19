import type { ReactNode } from 'react';
import { useState } from 'react';
import { FiArrowLeft,FiArrowRight,FiCheck,FiClock } from 'react-icons/fi';
import type { StudentLesson } from '../../../lib/services';
import { GlossaryContext } from '../translate/glossary-context';
import { EnglishToggle } from '../translate/EnglishToggle';
import type { LessonContent } from '../types';
import { DialogueSection } from './DialogueSection';
import { GoalsSection } from './GoalsSection';
import { GrammarSection } from './GrammarSection';
import { LessonTests } from './LessonTests';
import { PhrasesSection } from './PhrasesSection';
import { PracticePath } from './PracticePath';
import { ReadingSection } from './ReadingSection';
import type { SectionId } from './section-list';
import { lessonSections } from './section-list';
import { SoundsSection } from './SoundsSection';
import { WordsSection } from './WordsSection';

type Props = {
  lesson: StudentLesson;
  content: LessonContent;
  base: string;
  done: boolean;
  completing: boolean;
  actionError: string | null;
  onComplete: () => void;
};

/** Course v2 lesson: reader pages with audio and English help, then the practice path. */
export function LessonV2({ lesson, content, base, done, completing, actionError, onComplete }: Props) {
  const sections = lessonSections(content);
  const [active, setActive] = useState(0);
  const flashcards = lesson.activities.find((activity) => activity.type === 'FLASHCARD');
  const section = sections[active] ?? sections[0];
  function go(index: number) {
    setActive(index);
    document.getElementById('lesson-reader')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  const views: Record<SectionId, ReactNode> = {
    goals: <GoalsSection content={content} />,
    words: <WordsSection content={content} flashcardsHref={flashcards ? `${base}/activity/${flashcards.id}` : undefined} />,
    dialogue: <DialogueSection content={content} />,
    grammar: <GrammarSection content={content} />,
    phrases: <PhrasesSection content={content} />,
    sounds: <SoundsSection content={content} />,
    reading: <ReadingSection content={content} />,
  };
  return <GlossaryContext.Provider value={content.glossary}>
    <div className="space-y-3 roomy:space-y-4">
      <section id="lesson-reader" className="card min-w-0 scroll-mt-24 border border-base-300 bg-base-100 p-4 xl:p-5 roomy:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Lektion {content.lesson} · {content.level}</p>
            <h2 className="text-lg font-bold leading-snug">{content.titleEn}</h2>
            <p className="text-xs text-muted">Tap any German word to see what it means. Press the speaker to listen.</p>
          </div>
          <EnglishToggle level={content.level} />
        </div>
        <nav aria-label="Lesson pages" className="-mx-1 mt-4 flex gap-1 overflow-x-auto px-1 pb-1">
          {sections.map((item, index) => <button key={item.id} type="button" onClick={() => go(index)} aria-current={index === active ? 'page' : undefined}
            className={`btn btn-sm shrink-0 rounded-full ${index === active ? 'border-0 bg-primary text-primary-content' : 'border-line bg-base-100'}`}>
            <span lang="de">{item.label}</span><span className="hidden font-normal opacity-80 sm:inline">· {item.labelEn}</span>
          </button>)}
        </nav>
        <div className="mt-5">{views[section.id]}</div>
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-4">
          <button type="button" className="btn btn-sm btn-ghost" disabled={active === 0} onClick={() => go(active - 1)}><FiArrowLeft aria-hidden />Back</button>
          {active < sections.length - 1
            ? <button type="button" className="btn btn-sm rounded-full border-0 bg-primary text-primary-content" onClick={() => go(active + 1)}>{sections[active + 1].labelEn}<FiArrowRight aria-hidden /></button>
            : <a href="#lesson-practice" className="btn btn-sm rounded-full border-0 bg-primary text-primary-content">Start practising<FiArrowRight aria-hidden /></a>}
        </div>
      </section>
      <PracticePath activities={lesson.activities} base={base} />
      <LessonTests tests={lesson.tests} />
      <div className="flex flex-wrap items-center gap-3 rounded-box border border-line bg-base-100 p-4">
        <div className="min-w-0 grow">
          <p className="text-sm font-semibold">{done ? 'Lesson completed' : 'Lesson progress'}</p>
          <p className="text-xs text-muted">{done ? 'You can come back to listen and practise any time.' : 'The lesson completes itself when you finish every practice session.'}</p>
        </div>
        {done ? <span className="inline-flex items-center gap-1 text-sm font-semibold text-ok"><FiCheck aria-hidden />Completed</span>
          : <button type="button" disabled={completing} onClick={onComplete} className="btn btn-sm rounded-full border-line bg-base-100">
            {completing ? <span className="loading loading-spinner loading-xs" /> : <FiClock aria-hidden />}Mark as complete</button>}
      </div>
      {actionError ? <p role="alert" className="rounded-box bg-error px-3 py-2 text-xs font-medium text-error-content">{actionError}</p> : null}
    </div>
  </GlossaryContext.Provider>;
}
