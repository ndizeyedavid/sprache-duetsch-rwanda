import type { CSSProperties } from 'react';
import { useState } from 'react';
import { addDays, addWeeks, format, isSameDay, startOfWeek } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { MyCourse } from '../../lib/services';

export function DashboardWeekPanel({ courses }: { courses: MyCourse[] }) {
  const [anchor, setAnchor] = useState(() => new Date());
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const lessons = courses.flatMap((course) => course.modules.flatMap((module) => module.lessons));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(start, index);
    const count = lessons.filter((lesson) => lesson.progressStatus === 'COMPLETED' && lesson.completedAt && isSameDay(new Date(lesson.completedAt), date)).length;
    return { date, count };
  });
  const weekly = days.reduce((sum, day) => sum + day.count, 0);
  const done = lessons.filter((lesson) => lesson.progressStatus === 'COMPLETED').length;
  const percentage = lessons.length ? Math.round(done / lessons.length * 100) : 0;
  return (
    <section className="card learning-panel h-full gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Your progress</h2><span className="text-[10px] text-base-content/60">{done}/{lessons.length} lessons</span></div>
      <div className="flex items-center gap-5">
        <div className="radial-progress shrink-0 text-primary" style={{ '--value': percentage, '--size': '6rem', '--thickness': '7px' } as CSSProperties} role="progressbar" aria-label="Overall lesson completion" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><span className="text-2xl font-semibold text-base-content">{percentage}%</span></div>
        <div><p className="text-3xl font-semibold">{weekly}</p><p className="mt-1 text-xs text-base-content/65">{weekly === 1 ? 'lesson' : 'lessons'} this week</p><p className="mt-2 text-[10px] text-base-content/55">{lessons.length - done} left to explore</p></div>
      </div>
      <div className="flex items-center justify-between mt-auto border-t border-base-300/70 pt-3">
        <button type="button" aria-label="Previous week" onClick={() => setAnchor((date) => addWeeks(date, -1))} className="btn btn-ghost btn-xs btn-circle"><FiChevronLeft aria-hidden /></button>
        <button type="button" onClick={() => setAnchor(new Date())} aria-label="Return to current week" className="btn btn-ghost btn-xs rounded-full text-[10px]">{format(start, 'd MMM')} – {format(addDays(start, 6), 'd MMM')}</button>
        <button type="button" aria-label="Next week" onClick={() => setAnchor((date) => addWeeks(date, 1))} className="btn btn-ghost btn-xs btn-circle"><FiChevronRight aria-hidden /></button>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day) => <div key={day.date.toISOString()} className="text-center" aria-label={`${format(day.date, 'EEEE d MMM')}: ${day.count} lessons completed`}>
          <span className="block text-[9px] text-base-content/55">{format(day.date, 'EEEEE')}</span>
          <span className={`mt-1.5 grid aspect-square place-items-center rounded-full text-[10px] ${day.count ? 'bg-primary text-primary-content' : isSameDay(day.date, new Date()) ? 'border border-primary bg-primary/5 text-primary' : 'bg-base-200 text-base-content/50'}`}>{day.count || format(day.date, 'd')}</span>
        </div>)}
      </div>
    </section>
  );
}
