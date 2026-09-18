import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiCheckCircle, FiClock, FiFilter } from 'react-icons/fi';
import { ProgressBar } from '../ui/ProgressBar';
import { COLORS } from '../../lib/theme';
import type { MyCourse } from '../../lib/services';

const PALETTE = [COLORS.brand, '#5b8def', COLORS.sun, COLORS.coral, '#4cbc9a', COLORS.navy];

function colorFor(code: string): string {
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

type Props = { courses: MyCourse[]; filter: 'all' | 'enrolled' | 'completed'; onFilter: (f: 'all' | 'enrolled' | 'completed') => void; q: string; onQ: (v: string) => void };

export function CourseTable({ courses, filter, onFilter, q, onQ }: Props) {
  const filtered = courses.filter((c) => {
    const isCompleted = c.stats.completionPercentage === 100;
    if (filter === 'completed' && !isCompleted) return false;
    if (filter === 'enrolled' && isCompleted) return false;
    if (!q.trim()) return true;
    const needle = q.trim().toLowerCase();
    return `${c.level.code} ${c.level.title} ${c.level.levelLabel}`.toLowerCase().includes(needle);
  });

  if (courses.length === 0) {
    return (
      <div className="rounded-box border border-dashed border-line bg-base-200/30 px-6 py-10 text-center">
        <FiBookOpen aria-hidden className="mx-auto text-2xl text-muted" />
        <p className="mt-2 text-sm font-medium">No courses assigned</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">Your academic admin will enrol you — only your courses appear here, nothing else.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-box border border-line bg-base-100">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-base-200/40 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold"><FiFilter aria-hidden className="text-brand" />{filtered.length} of {courses.length}</span>
        <div className="flex gap-1.5">
          {(['all', 'enrolled', 'completed'] as const).map((f) => (
            <button key={f} type="button" onClick={() => onFilter(f)} className={`btn btn-xs rounded-full capitalize ${filter === f ? 'border-0 bg-brand text-white' : 'border-line bg-base-100'}`}>{f}</button>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-2">
          <input value={q} onChange={(e) => onQ(e.currentTarget.value)} placeholder="Search courses…" className="input input-sm rounded-full border-line bg-base-100 text-xs" />
          {q ? <button type="button" onClick={() => onQ('')} className="btn btn-ghost btn-xs btn-circle">×</button> : null}
        </span>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="table w-full text-sm">
          <thead>
            <tr className="bg-base-200/60 text-xs text-muted">
              <th className="text-left font-semibold">Course</th>
              <th className="text-left font-semibold">Status</th>
              <th className="w-56 text-left font-semibold">Progress</th>
              <th className="text-left font-semibold">Lessons</th>
              <th className="text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const accent = colorFor(c.level.code);
              const done = c.stats.completionPercentage === 100;
              return (
                <tr key={c.level.id} className="border-t border-line hover:bg-base-200/30">
                  <td>
                    <span className="flex items-center gap-3">
                      <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: accent }} aria-hidden />
                      <span>
                        <span className="block text-xs font-bold leading-tight">{c.level.code} · {c.level.title}</span>
                        <span className="block text-[11px] text-muted">{c.level.levelLabel} · {c.level.order ? `Level ${c.level.order}` : ''}</span>
                      </span>
                    </span>
                  </td>
                  <td>
                    {done ? <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-[#B30A00]"><FiCheckCircle aria-hidden />Completed</span> : <span className="inline-flex items-center gap-1 rounded-full bg-sun-soft px-2.5 py-1 text-xs font-semibold text-[#8A6800]"><FiClock aria-hidden />Enrolled</span>}
                  </td>
                  <td>
                    <ProgressBar value={c.stats.completionPercentage} tone={done ? 'brand' : 'sun'} />
                    <span className="mt-1 block text-[11px] text-muted">{c.stats.completionPercentage}%</span>
                  </td>
                  <td className="text-xs text-muted">{c.stats.completedLessons}/{c.stats.totalLessons}</td>
                  <td className="text-right">
                    <Link to={`/courses/${c.level.code.toLowerCase()}/learn`} className="btn btn-xs gap-1 rounded-full border-0 text-white hover:opacity-90" style={{ background: accent }}>
                      {done ? 'Review' : 'Continue'}<FiArrowRight aria-hidden />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 ? <p className="px-4 py-8 text-center text-sm text-muted">No courses match this filter.</p> : null}
      </div>

      <ul className="divide-y divide-line md:hidden">
        {filtered.map((c) => {
          const accent = colorFor(c.level.code);
          const done = c.stats.completionPercentage === 100;
          return (
            <li key={c.level.id} className="p-4">
              <span className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: accent }} aria-hidden />
                <span className="text-xs font-bold">{c.level.code} · {c.level.title}</span>
                {done ? <span className="ml-auto rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-[#B30A00]">Completed</span> : <span className="ml-auto rounded-full bg-sun-soft px-2 py-0.5 text-[11px] font-semibold text-[#8A6800]">Enrolled</span>}
              </span>
              <ProgressBar value={c.stats.completionPercentage} tone={done ? 'brand' : 'sun'} className="mt-3" />
              <p className="mt-1 text-[11px] text-muted">{c.stats.completedLessons}/{c.stats.totalLessons} · {c.stats.completionPercentage}%</p>
              <Link to={`/courses/${c.level.code.toLowerCase()}/learn`} className="btn btn-sm mt-3 w-full gap-1 rounded-full border-0 text-white" style={{ background: accent }}>{done ? 'Review' : 'Continue'}<FiArrowRight aria-hidden /></Link>
            </li>
          );
        })}
        {filtered.length === 0 ? <li className="p-8 text-center text-sm text-muted">No matches.</li> : null}
      </ul>
    </div>
  );
}
