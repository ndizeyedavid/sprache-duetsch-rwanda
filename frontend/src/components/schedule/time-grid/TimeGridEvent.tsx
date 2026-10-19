import { format } from 'date-fns';
import { FiEdit2,FiTrash2 } from 'react-icons/fi';
import { sessionStatusLabel } from '../../../lib/sessions-ui';
import { HOUR_HEIGHT,minuteToY,STATUS_BLOCK } from './constants';
import type { PlacedSession } from './layout';

export type EventActions = { onEdit?: (id: string) => void; onDelete?: (id: string) => void };
type Props = { item: PlacedSession; onOpen: (id: string) => void } & EventActions;

const action = 'grid size-6 place-items-center rounded-full bg-base-100 text-base-content shadow-sm hover:bg-primary hover:text-primary-content';

/** One class placed at its real time; staff get Edit / Delete on hover or focus. */
export function TimeGridEvent({ item, onOpen, onEdit, onDelete }: Props) {
  const { session, start, end, lane, lanes, outside } = item;
  const height = ((end - start) / 60) * HOUR_HEIGHT - 3;
  const time = `${format(new Date(session.startAt), 'HH:mm')}–${format(new Date(session.endAt), 'HH:mm')}`;
  const compact = height < 44 || Boolean(outside);
  const live = session.status === 'LIVE';
  const deletable = onDelete && !['LIVE', 'COMPLETED'].includes(session.status);
  return (
    <div onClick={(event) => event.stopPropagation()}
      className={`group absolute z-10 overflow-hidden rounded-field border-l-4 ${outside ? 'border-dashed outline-1 outline-dashed outline-current/40' : ''} transition-shadow hover:z-20 hover:ring-2 hover:ring-primary focus-within:z-20 ${STATUS_BLOCK[session.status] ?? STATUS_BLOCK.SCHEDULED}`}
      style={{ top: minuteToY(start) + 1, height, left: `calc(${(lane / lanes) * 100}% + 2px)`, width: `calc(${100 / lanes}% - 4px)` }}>
      <button type="button" onClick={() => onOpen(session.id)}
        title={`${session.title} · ${time} · ${sessionStatusLabel(session.status)}${outside ? ` · outside school hours (${outside === 'before' ? 'before 08:00' : 'after 22:00'})` : ''}`}
        aria-label={`${session.title}, ${time}, ${sessionStatusLabel(session.status)}${session.classGroup ? `, ${session.classGroup.name}` : ''}`}
        className="flex size-full flex-col px-2 py-1 text-left">
        {compact ? (
          <span className="truncate text-[0.6875rem] font-semibold leading-tight">
            {outside ? <span className="font-bold">{outside === 'before' ? '↑' : '↓'} </span> : null}
            <span className="font-medium opacity-80">{format(new Date(session.startAt), 'HH:mm')}</span> {session.title}
          </span>
        ) : (
          <>
            <span className="flex items-center gap-1 text-[0.625rem] font-semibold leading-tight">
              {live ? <span className="size-1.5 animate-pulse rounded-full bg-primary-content" aria-hidden /> : null}{time}
            </span>
            <span className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug">{session.title}</span>
            {height > 70 && session.classGroup ? <span className="mt-auto truncate text-[0.625rem] opacity-80">{session.classGroup.name}</span> : null}
          </>
        )}
      </button>
      {onEdit || deletable ? (
        <span className="absolute right-1 top-1 hidden gap-1 group-focus-within:flex group-hover:flex">
          {onEdit ? <button type="button" className={action} aria-label={`Edit ${session.title}`} title="Edit" onClick={() => onEdit(session.id)}><FiEdit2 aria-hidden className="text-[0.6875rem]" /></button> : null}
          {deletable ? <button type="button" className={action} aria-label={`Delete ${session.title}`} title="Delete" onClick={() => onDelete(session.id)}><FiTrash2 aria-hidden className="text-[0.6875rem]" /></button> : null}
        </span>
      ) : null}
    </div>
  );
}
