import { groupByDay } from './utils';
import { StudentSessionRow } from './StudentSessionRow';

type Session = { id: string; title: string; startAt: string; endAt: string; status: string; mode: string; meetingUrl: string | null; teacher: { firstName: string; lastName: string } | null; classGroup: { name: string } | null; room?: string | null };

type Props = { sessions: Session[]; onOpen: (id: string) => void };

export function StudentAgendaGrouped({ sessions, onOpen }: Props) {
  const groups = groupByDay(sessions);
  if (groups.length === 0) {
    return (
      <div className="rounded-box border border-dashed border-line bg-base-200/30 px-6 py-10 text-center">
        <p className="text-sm font-medium">No sessions in this view</p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-snug text-muted">Try another day, change the filter, or check back later — your teacher will schedule the next live class here.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {groups.map((g) => (
        <div key={g.date}>
          <div className="sticky top-0 z-10 -mx-1 bg-base-200/70 px-1 py-2 backdrop-blur">
            <h3 className="text-xs font-bold tracking-wide text-ink">{g.label}</h3>
          </div>
          <div className="mt-2 space-y-2 border-l-2 border-line pl-4">
            {g.items.map((s) => (
              <StudentSessionRow key={s.id} session={s} onOpen={() => onOpen(s.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
