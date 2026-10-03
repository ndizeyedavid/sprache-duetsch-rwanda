import '../../styles/lesson-map.css';
import { useState } from 'react';
import { FiCheck, FiPlay, FiSearch, FiX } from 'react-icons/fi';
import type { MyCourse } from '../../lib/services';
import { JourneyModule } from './JourneyModule';

type Props = { course: MyCourse; slug: string; layout?: 'vertical' | 'horizontal' };

export function StudentCourseModules({ course, slug }: Props) {
  const [q, setQ] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const modules = [...course.modules].sort((a, b) => a.order - b.order);
  const lessons = modules.flatMap((module) => [...module.lessons].sort((a, b) => a.order - b.order));
  const next = lessons.find((lesson) => lesson.progressStatus === 'IN_PROGRESS') ?? lessons.find((lesson) => lesson.progressStatus !== 'COMPLETED');
  const query = q.trim().toLowerCase();
  const filtered = modules.filter((module) => !query || module.title.toLowerCase().includes(query)
    || module.lessons.some((lesson) => `${lesson.title} ${lesson.description ?? ''}`.toLowerCase().includes(query)));

  function toggle(id: string) {
    setCollapsed((previous) => {
      const updated = new Set(previous);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });
  }

  return (
    <div className="journey-enter space-y-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{course.level.title}</h2>
        <div className="flex items-center gap-3 text-xs text-base-content/65">
          <span>{course.stats.completedLessons}/{course.stats.totalLessons}</span>
          <progress className="progress progress-primary h-1.5 w-24" value={course.stats.completionPercentage} max={100} aria-label="Course completion" />
          <span className="font-semibold text-base-content">{course.stats.completionPercentage}%</span>
        </div>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div aria-label="Progress legend" className="flex gap-3 text-[10px] text-base-content/65">
          <span className="flex items-center gap-1"><FiCheck aria-hidden className="text-primary" />Done</span>
          <span className="flex items-center gap-1"><FiPlay aria-hidden className="text-primary" />Next</span>
          <span className="flex items-center gap-1"><span aria-hidden className="size-2 rounded-full border border-base-content/40" />Upcoming</span>
        </div>
        <label className="input input-sm w-full rounded-full border-base-300 bg-base-100 sm:w-52">
          <FiSearch aria-hidden className="shrink-0 text-base-content/50" />
          <input aria-label="Search lessons" value={q} onChange={(event) => setQ(event.currentTarget.value)} placeholder="Find a lesson…" className="min-w-0 grow text-xs" />
          {q ? <button type="button" onClick={() => setQ('')} aria-label="Clear lesson search" className="btn btn-ghost btn-xs btn-circle"><FiX aria-hidden /></button> : null}
        </label>
      </div>
      {filtered.map((module) => <JourneyModule key={module.id} module={module} index={modules.indexOf(module)} slug={slug} nextId={next?.id} collapsed={collapsed.has(module.id)} onToggle={() => toggle(module.id)} query={query} />)}
      {filtered.length === 0 ? <p role="status" className="p-6 text-center text-sm text-base-content/65">{query ? 'No matching lessons.' : 'No lessons yet.'}</p> : null}
    </div>
  );
}
