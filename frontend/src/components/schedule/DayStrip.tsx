import { format,isSameDay,isToday } from 'date-fns';
import { weekDays } from './utils';

type Props = { anchor: Date; sessions: { startAt: string }[]; onPick: (day: Date) => void };

/** The anchor's week as tappable chips, with a dot on days that have classes (day view navigation). */
export function DayStrip({ anchor, sessions, onPick }: Props) {
  return (
    <div className="grid grid-cols-7 gap-1.5" role="group" aria-label="Pick a day this week">
      {weekDays(anchor).map((day) => {
        const count = sessions.filter((s) => isSameDay(new Date(s.startAt), day)).length;
        const active = isSameDay(day, anchor);
        return (
          <button key={day.toISOString()} type="button" onClick={() => onPick(day)} aria-pressed={active}
            aria-label={`${format(day, 'EEEE d MMMM')}: ${count} class${count === 1 ? '' : 'es'}`}
            className={`flex flex-col items-center gap-0.5 rounded-box border py-2 text-xs ${active ? 'border-primary bg-primary text-primary-content' : isToday(day) ? 'border-primary bg-brand-tint' : 'border-line bg-base-100 hover:border-primary'}`}>
            <span className="text-[0.625rem] font-semibold uppercase">{format(day, 'EEEEE')}</span>
            <span className="text-sm font-semibold">{format(day, 'd')}</span>
            <span className={`size-1.5 rounded-full ${count ? (active ? 'bg-primary-content' : 'bg-primary') : 'bg-transparent'}`} aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
