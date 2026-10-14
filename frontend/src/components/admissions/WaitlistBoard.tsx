import { FiUsers } from 'react-icons/fi';
import type { WaitlistGroup } from '../../lib/admissions-types';
import { SHIFT_LABEL } from './constants';
import { fullName,shortDate } from './utils';

function seatsText(group: WaitlistGroup): string {
  if (group.seatsLeft === null) return 'No class capacity set';
  return `${group.seatsLeft} of ${group.capacity} seats free`;
}

/** One ranked queue per level + intake. Position 1 is offered the next free seat. */
export function WaitlistBoard({ groups, onOpen }: { groups: WaitlistGroup[]; onOpen: (id: string) => void }) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <section key={group.key} className="rounded-box border border-line bg-base-100">
          <header className="flex flex-wrap items-start justify-between gap-2 border-b border-line p-4">
            <div>
              <h3 className="text-sm font-semibold">{group.level ? `${group.level.code} — ${group.level.title}` : 'Level not set'}</h3>
              <p className="text-xs text-muted">{group.intake ? `${group.intake.name} · starts ${shortDate(group.intake.startDate)}` : 'Intake not set'}</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-base-200 px-3 py-1 font-medium">{group.waiting} waiting</span>
              <span className={`rounded-full px-3 py-1 font-medium ${group.seatsLeft ? 'bg-brand text-white' : 'bg-base-200 text-muted'}`}>{seatsText(group)}</span>
              {group.acceptedPending ? <span className="rounded-full bg-base-200 px-3 py-1 font-medium">{group.acceptedPending} accepted, not enrolled</span> : null}
            </div>
          </header>
          <ol className="divide-y divide-line">
            {group.entries.map((entry) => (
              <li key={entry.id}>
                <button type="button" onClick={() => onOpen(entry.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-base-200/60">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-base-200 text-sm font-semibold" aria-label={`Position ${entry.position}`}>
                    {entry.position}
                  </span>
                  <span className="min-w-0 grow">
                    <span className="block truncate text-sm font-medium">{fullName(entry)}</span>
                    <span className="block truncate text-xs text-muted">
                      {entry.reference} · waitlisted {shortDate(entry.waitlistedAt ?? entry.createdAt)}
                      {entry.campus ? ` · ${entry.campus.name}` : ''}{entry.shift ? ` · ${SHIFT_LABEL[entry.shift]}` : ''}
                    </span>
                  </span>
                  <FiUsers aria-hidden className="shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
