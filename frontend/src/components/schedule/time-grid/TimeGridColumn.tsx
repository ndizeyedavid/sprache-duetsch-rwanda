import { addMinutes,format,isToday,startOfDay } from 'date-fns';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import { DAY_END_MIN,DAY_START_MIN,GRID_HEIGHT,HOUR_HEIGHT,minuteToY,SLOT_MINUTES } from './constants';
import type { PlacedSession } from './layout';
import { pastCutoff } from './layout';
import { NowLine } from './NowLine';
import { TimeGridEvent,type EventActions } from './TimeGridEvent';

type Props = EventActions & {
  day: Date;
  placed: PlacedSession[];
  now: Date;
  onOpen: (id: string) => void;
  /** Staff only: click an empty slot to schedule a class at that time. */
  onCreateAt?: (start: Date) => void;
};

const slotAt = (event: MouseEvent<HTMLDivElement>) => {
  const y = event.clientY - event.currentTarget.getBoundingClientRect().top;
  const minutes = DAY_START_MIN + Math.floor((y / HOUR_HEIGHT) * 60 / SLOT_MINUTES) * SLOT_MINUTES;
  return Math.max(DAY_START_MIN, Math.min(DAY_END_MIN - SLOT_MINUTES, minutes));
};

/** One day: hour lines, positioned classes, the now-line and (for staff) a hover slot to add a class. */
export function TimeGridColumn({ day, placed, now, onOpen, onCreateAt, onEdit, onDelete }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const today = isToday(day);
  // No new classes in the past: shade it and ignore clicks there.
  const cutoff = pastCutoff(day, now);
  const canCreate = Boolean(onCreateAt) && cutoff < DAY_END_MIN;
  const create = (minutes: number) => { if (minutes >= cutoff) onCreateAt?.(addMinutes(startOfDay(day), minutes)); };
  const pick = (minutes: number) => setHover(minutes >= cutoff ? minutes : null);
  return (
    <div
      className={`time-grid-column relative border-l border-line ${today ? 'bg-brand-tint' : ''} ${canCreate ? 'cursor-copy' : ''}`}
      style={{ height: GRID_HEIGHT }}
      onMouseMove={canCreate ? (event) => pick(slotAt(event)) : undefined}
      onMouseLeave={() => setHover(null)}
      onClick={canCreate ? (event) => create(slotAt(event)) : undefined}
    >
      {onCreateAt && cutoff > DAY_START_MIN ? (
        <div aria-hidden title="Past — classes can only be added from now on" className="time-grid-past pointer-events-none absolute inset-x-0 top-0 z-0" style={{ height: minuteToY(cutoff) }} />
      ) : null}
      {onCreateAt && hover !== null ? (
        <div className="pointer-events-none absolute inset-x-1 z-0 rounded-field border border-dashed border-primary px-2 text-[0.625rem] font-semibold text-primary"
          style={{ top: minuteToY(hover), height: (SLOT_MINUTES / 60) * HOUR_HEIGHT }}>
          + {format(addMinutes(startOfDay(day), hover), 'HH:mm')}
        </div>
      ) : null}
      {placed.map((item) => <TimeGridEvent key={item.session.id} item={item} onOpen={onOpen} onEdit={onEdit} onDelete={onDelete} />)}
      {today ? <NowLine now={now} /> : null}
    </div>
  );
}
