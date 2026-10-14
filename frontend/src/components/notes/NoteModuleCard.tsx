import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Panel } from '../ui/Panel';
import { NoteRow } from './NoteRow';
import type { NoteModuleGroup } from './notes-utils';

type Props = {
  group: NoteModuleGroup;
  /** Level code (e.g. "A1") for the module, when known; builds the lesson link. */
  levelCode: string | null;
  onError: (message: string) => void;
};

/** A module's notes, lesson by lesson, each with a way back to the lesson itself. */
export function NoteModuleCard({ group, levelCode, onError }: Props) {
  const count = group.lessons.reduce((sum, lesson) => sum + lesson.notes.length, 0);
  return (
    <Panel padded={false}>
      <header className="flex items-center gap-2 border-b border-base-300 px-4 py-3 sm:px-5">
        {levelCode ? <span className="badge badge-sm border-0 bg-brand font-semibold text-white">{levelCode}</span> : null}
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{group.moduleTitle}</h2>
        <span className="shrink-0 text-xs text-muted">{count} {count === 1 ? 'file' : 'files'}</span>
      </header>
      <div className="divide-y divide-base-300 px-4 sm:px-5">
        {group.lessons.map(lesson => (
          <section key={lesson.lessonId} aria-label={lesson.lessonTitle} className="py-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="min-w-0 truncate text-xs font-semibold uppercase tracking-wide text-muted">{lesson.lessonTitle}</h3>
              {levelCode ? (
                <Link to={`/courses/${levelCode.toLowerCase()}/learn/${lesson.lessonId}`} className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand hover:underline">
                  Lesson<FiArrowRight aria-hidden />
                </Link>
              ) : null}
            </div>
            <ul className="divide-y divide-base-300">
              {lesson.notes.map(note => <NoteRow key={note.id} note={note} onError={onError} />)}
            </ul>
          </section>
        ))}
      </div>
    </Panel>
  );
}
