import { FiCheck } from 'react-icons/fi';
import type { MapStop } from './course-map';

/** The stop marker on the path: number inside a progress ring; a check when done; pulsing when current. */
export function MapNode({ stop }: { stop: MapStop }) {
  const share = stop.total ? stop.done / stop.total : 0;
  const r = 26, c = 2 * Math.PI * r;
  const current = stop.state === 'current';
  return (
    <span className="relative grid size-16 place-items-center" aria-hidden>
      {current ? <span className="absolute inset-1 animate-ping rounded-full bg-brand-soft" /> : null}
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="5" className="stroke-base-300" />
        <circle cx="32" cy="32" r={r} fill="none" strokeWidth="5" strokeLinecap="round" className="stroke-primary"
          strokeDasharray={c} strokeDashoffset={c * (1 - share)} />
      </svg>
      <span className={`relative grid size-11 place-items-center rounded-full text-sm font-bold ${stop.state === 'upcoming' ? 'bg-base-100 text-muted' : 'bg-primary text-primary-content'}`}>
        {stop.state === 'done' ? <FiCheck className="text-lg" /> : String(stop.number).padStart(2, '0')}
      </span>
    </span>
  );
}
