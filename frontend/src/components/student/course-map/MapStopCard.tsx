import { FiArrowRight,FiBookOpen,FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { HERO_ART } from '../../hero/hero-art';
import type { MapStop } from './course-map';

const studyTime = (minutes: number) => (minutes >= 60 ? `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ''}` : `${minutes} min`);
const ACTION = { done: 'Review', current: 'Continue', upcoming: 'Start' } as const;

/** One module on the map: lesson photos, what it covers, a dot per lesson and the way in. */
export function MapStopCard({ stop, basePath }: { stop: MapStop; basePath: string }) {
  const current = stop.state === 'current';
  const href = stop.target ? `${basePath}/${stop.target.id}` : basePath;
  return (
    <article className={`overflow-hidden rounded-box border bg-base-100 transition-shadow ${current ? 'border-primary ring-4 ring-brand-soft' : 'border-line'} ${stop.state === 'upcoming' ? 'opacity-95' : ''}`}>
      <div className="relative h-32 overflow-hidden bg-brand-tint sm:h-36">
        {stop.cover ? (
          <div className={`grid h-full gap-0.5 ${stop.covers.length > 1 ? 'grid-cols-[2fr_1fr]' : ''}`}>
            <img src={stop.cover} alt="" aria-hidden loading="lazy" decoding="async" className={`size-full object-cover ${stop.state === 'upcoming' ? 'grayscale-[60%]' : ''}`} />
            {stop.covers[1] ? <img src={stop.covers[1]} alt="" aria-hidden loading="lazy" decoding="async" className={`size-full object-cover ${stop.state === 'upcoming' ? 'grayscale-[60%]' : ''}`} /> : null}
          </div>
        ) : <img src={HERO_ART.courses.src} alt="" aria-hidden loading="lazy" className="absolute bottom-0 right-2 h-full w-auto object-contain" />}
        <span className="absolute left-3 top-3 rounded-full bg-base-100 px-2.5 py-1 text-[0.6875rem] font-bold text-primary">Modul {String(stop.number).padStart(2, '0')}</span>
        {current ? <span className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[0.6875rem] font-bold text-primary-content">Du bist hier</span>
          : stop.state === 'done' ? <span className="absolute right-3 top-3 rounded-full bg-success px-2.5 py-1 text-[0.6875rem] font-bold text-success-content">Geschafft ✓</span> : null}
      </div>
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-semibold leading-snug">{stop.title}</h3>
          {stop.description ? <p className="mt-0.5 line-clamp-2 text-xs text-muted">{stop.description}</p> : null}
        </div>
        <ol className="flex flex-wrap gap-1.5" aria-label="Lessons">
          {stop.lessons.map((lesson, i) => {
            const done = lesson.progressStatus === 'COMPLETED', here = lesson.id === stop.target?.id && current;
            return (
              <li key={lesson.id}>
                <Link to={`${basePath}/${lesson.id}`} title={lesson.title} aria-label={`${lesson.title}${done ? ' (done)' : ''}`}
                  className={`grid size-7 place-items-center rounded-full border text-[0.625rem] font-bold ${done ? 'border-primary bg-primary text-primary-content' : here ? 'border-primary bg-base-100 text-primary ring-2 ring-brand-soft' : 'border-line bg-base-100 text-muted hover:border-primary'}`}>
                  {i + 1}
                </Link>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex flex-wrap gap-x-3 text-[0.6875rem] text-muted">
            <span className="inline-flex items-center gap-1"><FiBookOpen aria-hidden />{stop.done}/{stop.total} lessons</span>
            {stop.minutes ? <span className="inline-flex items-center gap-1"><FiClock aria-hidden />{studyTime(stop.minutes)}</span> : null}
          </p>
          <Link to={href} className={`btn btn-sm gap-1 rounded-full ${current ? 'btn-primary' : 'border-line bg-base-100'}`}>{ACTION[stop.state]}<FiArrowRight aria-hidden /></Link>
        </div>
      </div>
    </article>
  );
}
