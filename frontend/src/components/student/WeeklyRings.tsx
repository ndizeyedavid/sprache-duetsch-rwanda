import { useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiClock } from 'react-icons/fi';
import { format, isWithinInterval, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { COLORS } from '../../lib/theme';
import type { MyCourse } from '../../lib/services';

const PALETTE = [COLORS.brand, '#5b8def', COLORS.sun, COLORS.coral, '#4cbc9a', COLORS.navy, '#A098AE', '#ff6b35'];

function colorFor(code: string, index: number): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  return PALETTE[(hash + index) % PALETTE.length];
}

type Props = {
  courses: MyCourse[];
  weekAnchor: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function WeeklyRings({ courses, weekAnchor, onPrev, onNext, onToday }: Props) {
  const weekStart = startOfWeek(weekAnchor, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekAnchor, { weekStartsOn: 1 });
  const label = `${format(weekStart, 'd MMM')} – ${format(weekEnd, 'd MMM yyyy')}`;
  const isCurrentWeek = isWithinInterval(new Date(), { start: weekStart, end: weekEnd });

  const rings = useMemo(() => {
    if (courses.length === 0) {
      return [{ code: 'ALL', title: 'No due tasks', color: COLORS.brand, total: 1, completedInWeek: 1, remaining: 0, pct: 100, isEmpty: true, hasNoDueTasks: true }];
    }
    return courses.map((course, index) => {
      const lessons = course.modules.flatMap((m) => m.lessons);
      const total = lessons.length || 1;
      const completedInWeek = lessons.filter((lesson) => {
        if (lesson.progressStatus !== 'COMPLETED' || !lesson.completedAt) return false;
        try {
          const d = parseISO(lesson.completedAt);
          return isWithinInterval(d, { start: weekStart, end: weekEnd });
        } catch { return false; }
      }).length;
      const remaining = lessons.filter((lesson) => lesson.progressStatus !== 'COMPLETED').length;
      const hasNoDueTasks = remaining === 0;
      const pct = hasNoDueTasks ? 100 : Math.round((completedInWeek / total) * 100);
      return {
        code: course.level.code,
        title: course.level.title,
        color: colorFor(course.level.code, index),
        total,
        completedInWeek,
        remaining,
        pct,
        isEmpty: false,
        hasNoDueTasks,
      };
    });
  }, [courses, weekStart, weekEnd]);

  const allCaughtUp = rings.every((r) => r.remaining === 0 || r.isEmpty) || courses.length === 0;
  const size = Math.min(220 + (rings.length - 1) * 8, 260);
  const center = size / 2;
  const baseRadius = 52;
  const ringWidth = 11;
  const gap = 5;

  return (
    <div className="rounded-box border border-line bg-base-100 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold"><FiClock aria-hidden className="text-brand" />Weekly progress</h3>
        <span className="flex items-center gap-1">
          <button type="button" onClick={onPrev} aria-label="Previous week" className="btn btn-ghost btn-xs btn-circle"><FiChevronLeft aria-hidden /></button>
          <button type="button" onClick={onNext} aria-label="Next week" className="btn btn-ghost btn-xs btn-circle"><FiChevronRight aria-hidden /></button>
        </span>
      </div>
      <p className="mt-1 text-center text-xs font-semibold">{label}</p>
      {!isCurrentWeek ? <button type="button" onClick={onToday} className="btn btn-xs mx-auto mt-1 flex rounded-full border-line bg-base-100">Today</button> : null}

      <div className="mt-4 flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Weekly task rings">
          {rings.map((ring, index) => {
            const radius = baseRadius + index * (ringWidth + gap);
            const circumference = 2 * Math.PI * radius;
            const progress = (ring.pct / 100) * circumference;
            return (
              <g key={ring.code}>
                <circle cx={center} cy={center} r={radius} fill="none" stroke="#F1F0F3" strokeWidth={ringWidth} />
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={ringWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${progress} ${circumference - progress}`}
                  transform={`rotate(-90 ${center} ${center})`}
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </g>
            );
          })}
          <g>
            <text x={center} y={center - 6} textAnchor="middle" className="fill-ink text-sm font-bold" style={{ fontSize: '18px' }}>
              {allCaughtUp ? '100%' : `${rings.reduce((sum, r) => sum + r.completedInWeek, 0)} / ${rings.reduce((sum, r) => sum + r.total, 0)}`}
            </text>
            <text x={center} y={center + 14} textAnchor="middle" className="fill-muted" style={{ fontSize: '11px' }}>
              {allCaughtUp ? 'all caught up' : 'done this week'}
            </text>
          </g>
        </svg>
      </div>

      <div className="mt-2 space-y-2">
        {courses.length === 0 ? (
          <p className="rounded-box border border-brand/20 bg-brand-soft px-3 py-2 text-center text-xs font-medium text-[#B30A00]">There are no due tasks at the moment.</p>
        ) : (
          rings.map((ring) => (
            <div key={ring.code} className="flex items-center gap-3 rounded-box border border-line bg-base-100 px-3 py-2">
              <span className="size-3 shrink-0 rounded-full" style={{ background: ring.color }} aria-hidden />
              <span className="min-w-0 grow">
                <span className="block truncate text-xs font-semibold leading-tight">{ring.code} · {ring.title}</span>
                <span className="block text-[11px] text-muted">
                  {ring.hasNoDueTasks ? 'No due tasks · All caught up' : `${ring.completedInWeek} done · ${ring.remaining} remaining · ${ring.total} total`}
                </span>
              </span>
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${ring.color}18`, color: ring.color }}>{ring.pct}%</span>
            </div>
          ))
        )}
        {allCaughtUp && courses.length > 0 ? <p className="rounded-box bg-base-200 px-3 py-2 text-center text-xs text-muted">There are no due tasks at the moment. You&apos;re all caught up — ring shows 100%.</p> : null}
        <p className="text-center text-[11px] leading-snug text-muted">Each ring is a course (color matches its card). Use ← → to change week.</p>
      </div>
    </div>
  );
}
