import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiChevronDown, FiChevronRight, FiSearch } from 'react-icons/fi';
import type { MyCourse } from '../../lib/services';

type Props = { course: MyCourse; slug: string; activeLessonId: string | null; collapsed: Set<string>; onToggle: (id: string) => void; onSelect?: (id: string) => void };

export function CourseSidebar({ course, slug, activeLessonId, collapsed, onToggle, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const modules = course.modules.slice().sort((a, b) => a.order - b.order);
  const matches = modules.some(m => m.lessons.some(l => l.title.toLowerCase().includes(needle)) || m.title.toLowerCase().includes(needle));
  return <nav aria-label="Course content" className="card overflow-hidden border border-base-300/70 bg-base-100">
    <div className="journey-hero relative border-b border-base-300/60 p-5"><img src="/illustrations/study-books.webp" alt="" aria-hidden="true" width={400} height={366} className="pointer-events-none absolute right-3 top-3 h-14 w-16 object-contain" /><p className="pr-14 text-[10px] font-semibold uppercase tracking-widest text-primary">{course.level.code} · Learning guide</p><Link to={`/courses/${slug}`} className="mt-2 block pr-12 text-base font-semibold leading-snug">{course.level.title}</Link><div className="mt-4 flex justify-between text-[10px] text-base-content/60"><span>{course.stats.completedLessons}/{course.stats.totalLessons} complete</span><span>{course.stats.completionPercentage}%</span></div><progress className="progress mt-2 h-1.5 w-full text-primary" value={course.stats.completedLessons} max={course.stats.totalLessons || 1} aria-label="Course completion" /></div>
    <div className="p-3"><label className="input input-sm w-full rounded-xl border-base-300 bg-base-200/40"><FiSearch aria-hidden /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a lesson…" aria-label="Find a course lesson" />{query ? <button type="button" onClick={() => setQuery('')} aria-label="Clear lesson search" className="btn btn-ghost btn-xs btn-circle">×</button> : null}</label></div>
    <div className="px-2 pb-3">{modules.map((m, i) => {
      const lessons = m.lessons.slice().sort((a, b) => a.order - b.order).filter(l => !needle || m.title.toLowerCase().includes(needle) || l.title.toLowerCase().includes(needle));
      if (needle && !lessons.length) return null;
      const closed = !needle && collapsed.has(m.id);
      const done = m.lessons.filter(l => l.progressStatus === 'COMPLETED').length;
      return <section key={m.id} className="mb-2"><button type="button" onClick={() => onToggle(m.id)} aria-expanded={!closed} aria-controls={`module-${m.id}`} className="flex w-full items-center gap-2 rounded-xl px-3 py-3 text-left hover:bg-base-200"><span className="min-w-0 flex-1"><span className="block text-[9px] uppercase tracking-widest text-base-content/45">Section {String(i + 1).padStart(2, '0')} · {done}/{m.lessons.length}</span><span className="mt-1 block text-xs font-semibold">{m.title}</span></span>{closed ? <FiChevronRight aria-hidden /> : <FiChevronDown aria-hidden />}</button>
        {!closed ? <ul id={`module-${m.id}`} className="menu menu-sm w-full gap-1 p-0">{lessons.map(l => {
          const active = l.id === activeLessonId;
          const complete = l.progressStatus === 'COMPLETED';
          const row = <><span className={`grid size-6 shrink-0 place-items-center rounded-lg text-[10px] ${active ? 'bg-primary-content/20 text-primary-content' : complete ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/50'}`}>{complete ? <FiCheck aria-hidden /> : l.order}</span><span className="min-w-0 flex-1"><span className="block text-xs leading-5">{l.title}</span><span className="block text-[9px] opacity-65">{active ? 'You are here' : complete ? 'Completed' : l.progressStatus === 'IN_PROGRESS' ? 'In progress' : 'Not started'}{l.estimatedMinutes ? ` · ${l.estimatedMinutes} min` : ''}</span></span></>;
          const style = `flex gap-2 rounded-xl px-3 py-2.5 ${active ? 'bg-primary! font-semibold text-primary-content!' : 'hover:bg-base-200'}`;
          return <li key={l.id}>{onSelect ? <button type="button" onClick={() => onSelect(l.id)} aria-current={active ? 'page' : undefined} className={style}>{row}</button> : <Link to={`/courses/${slug}/learn/${l.id}`} aria-current={active ? 'page' : undefined} className={style}>{row}</Link>}</li>;
        })}{!lessons.length ? <li className="px-3 py-2 text-xs text-base-content/50">No lessons yet.</li> : null}</ul> : null}
      </section>;
    })}{!matches ? <p className="p-4 text-center text-xs text-base-content/55">No lessons found.</p> : null}</div>
  </nav>;
}
