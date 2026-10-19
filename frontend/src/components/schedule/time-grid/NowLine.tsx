import { DAY_END_MIN,DAY_START_MIN,minuteToY } from './constants';

/** Red "current time" rule across today's column (only during 08:00–22:00). */
export function NowLine({ now }: { now: Date }) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  // Outside school hours there is nothing to point at.
  if (minutes < DAY_START_MIN || minutes > DAY_END_MIN) return null;
  const top = minuteToY(minutes);
  return (
    <div className="pointer-events-none absolute inset-x-0 z-30" style={{ top }} aria-hidden>
      <div className="relative h-0.5 bg-primary">
        <span className="absolute -left-1.5 -top-1.25 size-3 rounded-full bg-primary" />
      </div>
    </div>
  );
}
