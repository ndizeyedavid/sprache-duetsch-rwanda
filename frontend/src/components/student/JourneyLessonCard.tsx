import { Link } from 'react-router-dom';
import { FiBookOpen, FiCheck, FiFileText, FiFilm, FiHeadphones, FiLayers, FiPlay } from 'react-icons/fi';
import { humanize } from '../../lib/services';
import type { MyLesson } from '../../lib/services';

type Props = { lesson: MyLesson; index: number; position: number; columns: number; slug: string; next: boolean };

export function JourneyLessonCard({ lesson, index, position, columns, slug, next }: Props) {
  const complete = lesson.progressStatus === 'COMPLETED';
  const started = lesson.progressStatus === 'IN_PROGRESS';
  const row = Math.floor(position / columns);
  const column = row % 2 === 0 ? position % columns + 1 : columns - position % columns;
  const Icon = ({ VIDEO: FiFilm, AUDIO: FiHeadphones, PDF: FiFileText, MIXED: FiLayers })[lesson.contentType] ?? FiBookOpen;
  const status = complete ? 'Completed' : started ? 'In progress' : next ? 'Next lesson' : 'Not started';
  return (
    <li className="lesson-map-item min-w-0" style={{ gridColumn: column, gridRow: row + 1 }}>
      <Link to={`/courses/${slug}/learn/${lesson.id}`} aria-current={next ? 'step' : undefined}
        aria-label={`${index + 1}. ${lesson.title} — ${status}${lesson.estimatedMinutes ? `, ${lesson.estimatedMinutes} minutes` : ''}`}
        className="lesson-map-link group relative flex h-full flex-col items-center rounded-field px-2 py-3 text-center focus-visible:outline-offset-0">
        <span data-lesson-node className={`relative z-10 grid size-12 shrink-0 place-items-center rounded-full border-2 motion-safe:transition-transform motion-safe:group-hover:scale-110 ${complete ? 'border-primary bg-primary text-primary-content' : next ? 'border-primary bg-primary text-primary-content ring-4 ring-primary/15' : started ? 'border-primary bg-base-100 text-primary' : 'border-base-300 bg-base-100 text-base-content/60'}`}>
          {complete ? <FiCheck aria-hidden className="text-xl" /> : next ? <FiPlay aria-hidden className="text-lg" /> : <Icon aria-hidden className="text-lg" />}
          <span aria-hidden className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full border border-base-300 bg-base-100 text-[9px] font-semibold text-base-content">{index + 1}</span>
        </span>
        <span className="lesson-map-label relative z-10 mt-3 max-w-44 rounded-md bg-base-100 px-1 text-xs font-semibold leading-5">{lesson.title}</span>
        <span className="relative z-10 mt-0.5 rounded-md bg-base-100 px-1 text-[10px] text-base-content/60">
          {next ? <strong className="font-semibold text-primary">{started ? 'Continue' : 'Start'}{lesson.estimatedMinutes ? ' · ' : ''}</strong> : null}
          {lesson.estimatedMinutes ? `${lesson.estimatedMinutes} min` : humanize(lesson.contentType)}
        </span>
      </Link>
    </li>
  );
}
