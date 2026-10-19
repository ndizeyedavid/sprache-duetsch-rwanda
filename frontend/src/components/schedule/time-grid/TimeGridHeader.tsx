import { format,isToday } from 'date-fns';
import { AXIS_WIDTH } from './constants';

type Props = { days: Date[]; counts: number[]; zone: string; onPickDay?: (day: Date) => void };

/** Sticky day headings; clicking one opens that day on its own. */
export function TimeGridHeader({ days, counts, zone, onPickDay }: Props) {
  return (
    <div className="sticky top-0 z-40 grid border-b border-line bg-base-100" style={{ gridTemplateColumns: `${AXIS_WIDTH}px repeat(${days.length}, minmax(0, 1fr))` }}>
      <div className="sticky left-0 z-10 flex items-end bg-base-100 px-1 pb-2 text-[0.5625rem] font-semibold leading-tight text-muted" title={`Times in ${zone}`}>
        {zone.split('/').pop()?.replaceAll('_', ' ')}
      </div>
      {days.map((day, index) => {
        const today = isToday(day);
        const label = (
          <>
            <span className={`text-[0.6875rem] font-semibold uppercase tracking-wider ${today ? 'text-primary' : 'text-muted'}`}>{format(day, 'EEE')}</span>
            <span className={`grid size-8 place-items-center rounded-full text-sm font-semibold ${today ? 'bg-primary text-primary-content' : ''}`}>{format(day, 'd')}</span>
            <span className="text-[0.625rem] text-muted">{counts[index] ? `${counts[index]} class${counts[index] === 1 ? '' : 'es'}` : ' '}</span>
          </>
        );
        return onPickDay ? (
          <button key={day.toISOString()} type="button" onClick={() => onPickDay(day)} aria-label={`Open ${format(day, 'EEEE d MMMM')}`}
            className="flex flex-col items-center gap-0.5 border-l border-line py-2 hover:bg-base-200">{label}</button>
        ) : (
          <div key={day.toISOString()} className="flex flex-col items-center gap-0.5 border-l border-line py-2">{label}</div>
        );
      })}
    </div>
  );
}
