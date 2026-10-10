import { useId } from 'react';
import { FiCheck,FiChevronDown } from 'react-icons/fi';
import type { MyModule } from '../../lib/services';
import { JourneyLessonCard } from './JourneyLessonCard';
import { useLessonCanvas } from './useLessonCanvas';

type Props = {
  module: MyModule; index: number; slug: string; nextId?: string;
  collapsed: boolean; onToggle: () => void; query: string;
};

export function JourneyModule({ module, index, slug, nextId, collapsed, onToggle, query }: Props) {
  const contentId = useId();
  const lessons = [...module.lessons].sort((a, b) => a.order - b.order);
  const done = lessons.filter((lesson) => lesson.progressStatus === 'COMPLETED').length;
  const complete = lessons.length > 0 && done === lessons.length;
  const visible = lessons.filter((lesson) => !query || module.title.toLowerCase().includes(query)
    || `${lesson.title} ${lesson.description ?? ''}`.toLowerCase().includes(query));
  const expanded = !!query || !collapsed;
  const canvas = useLessonCanvas(`${expanded}:${visible.map((lesson) => lesson.id).join(',')}`);

  return (
    <section className="card overflow-hidden border border-base-300/80 bg-base-100">
      <h3>
        <button type="button" onClick={onToggle} disabled={!!query} aria-expanded={expanded} aria-controls={contentId}
          className="flex w-full items-center gap-3 border-b border-base-300/60 bg-base-200/50 px-4 py-3 text-left disabled:cursor-default">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-base-100 text-xs font-semibold">{complete ? <FiCheck aria-hidden /> : String(index + 1).padStart(2, '0')}</span>
          <span className="min-w-0 flex-1 text-sm font-semibold">{module.title}</span>
          <span className="shrink-0 text-xs text-base-content/60" aria-label={`${done} of ${lessons.length} lessons completed`}>{done}/{lessons.length}</span>
          <progress className="progress progress-primary hidden h-1 w-16 sm:block" value={done} max={lessons.length || 1} aria-label={`${module.title} progress`} />
          <FiChevronDown aria-hidden className={`shrink-0 motion-safe:transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </h3>
      <div id={contentId} hidden={!expanded} className="lesson-map-surface relative px-3 py-2 sm:px-5">
        {visible.length ? <div className="relative">
          {!query && canvas.width > 0 ? <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${canvas.width} ${canvas.height}`}>
            {canvas.paths.map((path, position) => <path key={visible[position].id} d={path} fill="none" strokeWidth="2" strokeLinecap="round"
              className={visible[position].progressStatus === 'COMPLETED' ? 'stroke-primary' : 'stroke-base-content/20'}
              strokeDasharray={visible[position].progressStatus === 'COMPLETED' ? undefined : '3 5'} />)}
          </svg> : null}
          <ol ref={canvas.ref} className={`lesson-map-grid relative grid ${canvas.columns === 1 ? 'lesson-map-single' : ''}`} style={{ gridTemplateColumns: `repeat(${canvas.columns}, minmax(0, 1fr))` }}>
            {visible.map((lesson, position) => <JourneyLessonCard key={lesson.id} lesson={lesson} index={lessons.indexOf(lesson)} position={position} columns={canvas.columns} slug={slug} next={lesson.id === nextId} />)}
          </ol>
        </div> : <p className="p-5 text-center text-xs text-base-content/60">No lessons yet.</p>}
      </div>
    </section>
  );
}
