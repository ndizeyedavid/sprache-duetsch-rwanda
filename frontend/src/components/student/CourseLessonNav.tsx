import { FiBookOpen, FiCheckCircle, FiClock, FiPlayCircle } from 'react-icons/fi';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';
import { humanize } from '../../lib/services';
import type { MyCourse } from '../../lib/services';

type Props = {
  course: MyCourse;
  selectedId: string | null;
  onSelect: (id: string) => void;
  q: string;
  onQ: (v: string) => void;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
};

function lessonIcon(status: string) {
  if (status === 'COMPLETED') return FiCheckCircle;
  if (status === 'IN_PROGRESS') return FiClock;
  return FiPlayCircle;
}

function toneFor(status: string): 'brand' | 'sun' | 'muted' {
  if (status === 'COMPLETED') return 'brand';
  if (status === 'IN_PROGRESS') return 'sun';
  return 'muted';
}

export function CourseLessonNav({ course, selectedId, onSelect, q, onQ, collapsed, onToggle }: Props) {
  const filteredModules = course.modules.map((mod) => {
    const needle = q.trim().toLowerCase();
    const lessons = needle
      ? mod.lessons.filter((l) => `${l.title} ${l.description ?? ''}`.toLowerCase().includes(needle))
      : mod.lessons;
    return { ...mod, lessons };
  });

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">{course.level.code} · {course.level.title}</p>
      <div className="mt-3"><ProgressBar value={course.stats.completionPercentage} tone="brand" /></div>
      <p className="mt-2 text-xs text-muted">{course.stats.completedLessons}/{course.stats.totalLessons} lessons · {course.stats.completionPercentage}%</p>

      <div className="relative mt-4">
        <FiBookOpen aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input value={q} onChange={(e) => onQ(e.currentTarget.value)} placeholder="Search lessons…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-xs" />
        {q ? <button type="button" onClick={() => onQ('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2">×</button> : null}
      </div>

      <div className="mt-4 space-y-3">
        {filteredModules.map((mod) => {
          const isCollapsed = collapsed.has(mod.id);
          const done = mod.lessons.filter((l) => l.progressStatus === 'COMPLETED').length;
          return (
            <div key={mod.id} className="overflow-hidden rounded-box border border-line bg-base-100">
              <button type="button" onClick={() => onToggle(mod.id)} className="flex w-full items-center gap-2 bg-base-200 px-3 py-2.5 text-left">
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${done === mod.lessons.length && mod.lessons.length ? 'bg-brand text-white' : 'bg-base-100 text-muted'}`}>{done}/{mod.lessons.length}</span>
                <span className="min-w-0 grow">
                  <span className="block truncate text-xs font-semibold leading-tight">{mod.title}</span>
                  <span className="block truncate text-[11px] text-muted">{mod.description ?? `${mod.lessons.length} lessons`}</span>
                </span>
                <span className="text-muted">{isCollapsed ? '›' : '⌃'}</span>
              </button>
              {!isCollapsed ? (
                mod.lessons.length === 0 ? (
                  <p className="px-3 py-4 text-center text-xs text-muted">No lessons yet.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {mod.lessons.map((lesson) => {
                      const Icon = lessonIcon(lesson.progressStatus);
                      const tone = toneFor(lesson.progressStatus);
                      const active = selectedId === lesson.id;
                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(lesson.id)}
                            className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs transition ${active ? 'bg-brand-soft text-[#B30A00]' : 'hover:bg-base-200/50'}`}
                          >
                            <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${active ? 'bg-brand text-white' : tone === 'brand' ? 'bg-brand-soft text-brand' : tone === 'sun' ? 'bg-sun-soft text-[#8A6800]' : 'bg-base-200 text-muted'}`}>
                              <Icon aria-hidden className="text-sm" />
                            </span>
                            <span className="min-w-0 grow">
                              <span className="block truncate font-medium leading-tight">{lesson.title}</span>
                              <span className="block truncate text-[11px] text-muted">{humanize(lesson.contentType)} {lesson.estimatedMinutes ? `· ${lesson.estimatedMinutes} min` : ''}</span>
                            </span>
                            <StatusBadge status={lesson.progressStatus === 'COMPLETED' ? 'Completed' : humanize(lesson.progressStatus)} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : null}
            </div>
          );
        })}
        {filteredModules.every((m) => m.lessons.length === 0) && q ? <p className="py-4 text-center text-xs text-muted">No lessons match “{q}”.</p> : null}
      </div>
    </div>
  );
}
