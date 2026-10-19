import { FiArrowUpRight,FiAward,FiMap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyCourse } from '../../../lib/services';
import { courseStops } from './course-map';
import { MapNode } from './MapNode';
import { MapStopCard } from './MapStopCard';
import { useMapPath } from './useMapPath';

const ROW = 'relative grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 md:grid-cols-[minmax(0,1fr)_12rem_minmax(0,1fr)] md:gap-6';

/**
 * The course as a journey: modules alternate left and right of a path (one column on phones),
 * each with its photos and progress, from the first lesson to the finish flag.
 */
export function CourseMap({ course }: { course: MyCourse }) {
  const stops = courseStops(course);
  const basePath = `/courses/${course.level.code.toLowerCase()}/learn`;
  const { completedLessons, totalLessons, completionPercentage } = course.stats;
  const finished = totalLessons > 0 && completedLessons === totalLessons;
  const path = useMapPath(stops.map((stop) => `${stop.id}:${stop.state}`).join(','));
  // The solid line runs through every stop already reached, and on to the finish once the course is done.
  const reached = finished ? stops.length + 1 : stops.filter((stop) => stop.state !== 'upcoming').length;
  if (!stops.length) return <section className="card border border-line bg-base-100 p-6 text-sm text-muted">Your modules will appear here.</section>;
  return (
    <section aria-label="Course map" className="card border border-line bg-base-100 p-5 sm:p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold"><FiMap aria-hidden className="text-primary" />Deine Lernreise</h2>
          <p className="mt-0.5 text-xs text-muted">{completedLessons} of {totalLessons} lessons · {completionPercentage}% · {stops.length} modules</p>
        </div>
        <Link to={basePath} className="btn btn-ghost btn-xs gap-1 rounded-full border border-line">All lessons <FiArrowUpRight aria-hidden /></Link>
      </div>
      {/* From md each module gets its own row, alternating sides, and its marker sits on the inner edge of a
          middle band, so the measured line between markers zig-zags down the page (straight on phones). */}
      <ol ref={path.ref} className="relative flex flex-col gap-8 md:gap-10">
        {path.width ? (
          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${path.width} ${path.height}`}>
            <polyline points={path.points.join(' ')} fill="none" strokeWidth="3" strokeDasharray="7 7" strokeLinecap="round" strokeLinejoin="round" className="stroke-base-300" />
            {reached > 1 ? <polyline points={path.points.slice(0, reached).join(' ')} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" /> : null}
          </svg>
        ) : null}
        {stops.map((stop, index) => (
          <li key={stop.id} className={ROW}>
            <div className={`col-start-2 row-start-1 ${index % 2 ? 'md:col-start-3' : 'md:col-start-1'}`}><MapStopCard stop={stop} basePath={basePath} /></div>
            <div data-map-node className={`relative col-start-1 row-start-1 justify-self-center md:col-start-2 ${index % 2 ? 'md:justify-self-end' : 'md:justify-self-start'}`}><MapNode stop={stop} /></div>
          </li>
        ))}
        <li className={ROW}>
          <div data-map-node className={`relative col-start-1 row-start-1 justify-self-center md:col-start-2 ${stops.length % 2 ? 'md:justify-self-end' : 'md:justify-self-start'}`}>
            <span className={`grid size-16 place-items-center rounded-full text-2xl ${finished ? 'bg-primary text-primary-content' : 'border-2 border-dashed border-primary bg-brand-tint text-primary'}`}><FiAward aria-hidden /></span>
          </div>
          <p className={`col-start-2 row-start-1 text-sm font-semibold ${stops.length % 2 ? 'md:col-start-3' : 'md:col-start-1 md:text-right'}`}>{finished ? `${course.level.code} geschafft — herzlichen Glückwunsch!` : `Ziel: ${course.level.code} geschafft`}
            <span className="block text-xs font-normal text-muted">{finished ? 'Your certificate is next.' : `${totalLessons - completedLessons} lessons to go`}</span></p>
        </li>
      </ol>
    </section>
  );
}
