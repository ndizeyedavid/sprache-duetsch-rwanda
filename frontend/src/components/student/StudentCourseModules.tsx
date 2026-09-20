import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiCheckCircle, FiChevronDown, FiChevronUp, FiClock, FiFileText, FiFilm, FiLayers, FiMusic, FiPlayCircle, FiSearch } from 'react-icons/fi';
import { StatusBadge } from '../ui/StatusBadge';
import { humanize } from '../../lib/services';
import type { MyCourse } from '../../lib/services';

function contentIcon(type: string) {
  switch (type) {
    case 'VIDEO': return FiFilm;
    case 'AUDIO': return FiMusic;
    case 'PDF': return FiFileText;
    case 'MIXED': return FiLayers;
    default: return FiBookOpen;
  }
}

function lessonTone(status: string): 'brand' | 'sun' | 'muted' {
  if (status === 'COMPLETED') return 'brand';
  if (status === 'IN_PROGRESS') return 'sun';
  return 'muted';
}

function LessonIcon({ status }: { status: string }) {
  if (status === 'COMPLETED') return <FiCheckCircle aria-hidden className="text-sm" />;
  if (status === 'IN_PROGRESS') return <FiClock aria-hidden className="text-sm" />;
  return <FiPlayCircle aria-hidden className="text-sm" />;
}

type Props = { course: MyCourse; slug: string; layout?: 'vertical' | 'horizontal' };

export function StudentCourseModules({ course, slug, layout = 'vertical' }: Props) {
  const [q, setQ] = useState('');
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filteredModules = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return course.modules;
    return course.modules.map((mod) => ({
      ...mod,
      lessons: mod.lessons.filter((l) => `${l.title} ${l.description ?? ''}`.toLowerCase().includes(needle)),
    }));
  }, [course.modules, q]);

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Horizontal mode: single expandable module at a time (Coursera) vs all stacked (Canvas)
  const horizontalActive = layout === 'horizontal' ? (filteredModules.find((m) => !collapsed.has(m.id))?.id ?? filteredModules[0]?.id ?? null) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative grow sm:max-w-sm">
          <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.currentTarget.value)} placeholder="Search lessons…" className="input w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-sm" />
          {q ? <button type="button" onClick={() => setQ('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2">×</button> : null}
        </div>
        <button type="button" onClick={() => setCollapsed(new Set(filteredModules.map((m) => m.id)))} className="btn btn-xs rounded-full border-line bg-base-100">Collapse all</button>
        <button type="button" onClick={() => setCollapsed(new Set())} className="btn btn-xs rounded-full border-line bg-base-100">Expand all</button>
      </div>
      {layout === 'horizontal' && filteredModules.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {filteredModules.map((mod) => (
            <button
              key={mod.id}
              type="button"
              onClick={() => setCollapsed(new Set(filteredModules.filter((m) => m.id !== mod.id).map((m) => m.id)))}
              className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${horizontalActive === mod.id ? 'border-brand bg-brand text-white' : 'border-line bg-base-100'}`}
            >
              {mod.title} · {mod.lessons.length}
            </button>
          ))}
        </div>
      ) : null}

      {filteredModules.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">No modules published yet.</p>
      ) : null}

      {(layout === 'horizontal' && filteredModules.length > 1 ? filteredModules.filter((m) => m.id === horizontalActive) : filteredModules).map((mod) => {
        const done = mod.lessons.filter((l) => l.progressStatus === 'COMPLETED').length;
        const isCollapsed = layout === 'horizontal' ? false : collapsed.has(mod.id);
        const lessons = [...mod.lessons].sort((a, b) => a.order - b.order);
        return (
          <div key={mod.id} className="overflow-hidden rounded-box border border-line bg-base-100">
            <button type="button" onClick={() => toggle(mod.id)} aria-expanded={!isCollapsed} className="flex w-full items-center gap-3 bg-base-200 px-4 py-3 text-left">
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${!isCollapsed ? 'bg-brand text-white' : 'bg-base-100 text-muted'}`}>
                {isCollapsed ? <FiChevronDown aria-hidden /> : <FiChevronUp aria-hidden />}
              </span>
              <span className="min-w-0 grow">
                <span className="block truncate text-sm font-bold leading-tight">{mod.title}</span>
                <span className="block truncate text-[11px] text-muted">{mod.description ?? `${lessons.length} lessons`} · {done}/{lessons.length} completed</span>
              </span>
              <span className={`hidden shrink-0 rounded-full px-2.5 py-1 text-xs font-medium sm:inline-flex ${done === lessons.length && lessons.length ? 'bg-brand-soft text-[#B30A00]' : 'bg-base-100 text-muted'}`}>
                {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
              </span>
            </button>

            {!isCollapsed ? (
              lessons.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-muted">No lessons in this module yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {lessons.map((lesson) => {
                    const Icon = contentIcon(lesson.contentType);
                    const tone = lessonTone(lesson.progressStatus);
                    return (
                      <li key={lesson.id}>
                        <Link
                          to={`/courses/${slug}/learn/${lesson.id}`}
                          className="flex items-center gap-3 border-l-4 border-transparent px-4 py-3 text-left transition hover:border-brand/20 hover:bg-base-200/50"
                        >
                          <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${tone === 'brand' ? 'bg-brand-soft text-brand' : tone === 'sun' ? 'bg-sun-soft text-[#8A6800]' : 'bg-base-200 text-muted'}`}>
                            <Icon aria-hidden className="text-sm" />
                          </span>
                          <span className="min-w-0 grow">
                            <span className="block truncate text-sm font-medium leading-tight">{lesson.title}</span>
                            <span className="block truncate text-[11px] text-muted">{humanize(lesson.contentType)} {lesson.estimatedMinutes ? `· ${lesson.estimatedMinutes} min` : ''}</span>
                          </span>
                          <span className="flex shrink-0 items-center gap-2">
                            <span className={`hidden items-center gap-1 sm:flex size-7 justify-center rounded-full ${lesson.progressStatus === 'COMPLETED' ? 'bg-brand-soft text-brand' : lesson.progressStatus === 'IN_PROGRESS' ? 'bg-sun-soft text-[#8A6800]' : 'bg-base-200 text-muted'}`}>
                              <LessonIcon status={lesson.progressStatus} />
                            </span>
                            <StatusBadge status={lesson.progressStatus === 'COMPLETED' ? 'Completed' : humanize(lesson.progressStatus)} />
                          </span>
                        </Link>
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
  );
}
