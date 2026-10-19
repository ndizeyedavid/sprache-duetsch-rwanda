import { isToday } from 'date-fns';
import { useEffect,useMemo,useRef } from 'react';
import { viewerTimeZone } from '../../../lib/session-time';
import { AXIS_WIDTH,DAY_START_HOUR,GRID_HEIGHT,HOUR_HEIGHT,HOURS } from './constants';
import { formatHour,initialScrollHour,layoutDay,type GridSession } from './layout';
import { TimeGridColumn } from './TimeGridColumn';
import { TimeGridHeader } from './TimeGridHeader';
import type { EventActions } from './TimeGridEvent';

type Props = EventActions & {
  days: Date[];
  sessions: GridSession[];
  onOpen: (id: string) => void;
  onPickDay?: (day: Date) => void;
  onCreateAt?: (start: Date) => void;
};

/**
 * Day/week calendar for the 08:00–22:00 school day: hours down the left, one scrollable column per day, classes drawn at
 * their real start and length. Opens scrolled to "now" (today) or just above the first class.
 */
export function TimeGrid({ days, sessions, onOpen, onPickDay, onCreateAt, onEdit, onDelete }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const now = new Date();
  const columns = useMemo(() => days.map((day) => layoutDay(sessions, day)), [days, sessions]);
  const showsToday = days.some((day) => isToday(day));
  const firstHour = initialScrollHour(columns.flat(), showsToday ? now : null);
  const rangeKey = days.map((day) => day.toDateString()).join('|');

  useEffect(() => {
    scroller.current?.scrollTo({ top: Math.max(0, firstHour - DAY_START_HOUR) * HOUR_HEIGHT });
    // Re-anchor only when the visible days change, never on a background refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey]);

  const template = `${AXIS_WIDTH}px repeat(${days.length}, minmax(0, 1fr))`;
  return (
    <div ref={scroller} className="relative max-h-[min(72vh,48.75rem)] overflow-auto rounded-box border border-line bg-base-100" tabIndex={0} aria-label="Class timetable">
      <div style={{ minWidth: days.length > 1 ? AXIS_WIDTH + days.length * 104 : undefined }}>
        <TimeGridHeader days={days} counts={columns.map((placed) => placed.length)} zone={viewerTimeZone()} onPickDay={days.length > 1 ? onPickDay : undefined} />
        <div className="time-grid-body grid" style={{ gridTemplateColumns: template }}>
          <div className="sticky left-0 z-30 bg-base-100" style={{ height: GRID_HEIGHT }} aria-hidden>
            {HOURS.map((hour) => (
              <span key={hour} className={`absolute right-2 text-[0.625rem] font-medium tabular-nums text-muted ${hour === DAY_START_HOUR ? 'translate-y-1' : '-translate-y-1/2'}`} style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT }}>
                {formatHour(hour)}
              </span>
            ))}
          </div>
          {days.map((day, index) => (
            <TimeGridColumn key={day.toISOString()} day={day} placed={columns[index]} now={now} onOpen={onOpen} onCreateAt={onCreateAt} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      </div>
    </div>
  );
}
