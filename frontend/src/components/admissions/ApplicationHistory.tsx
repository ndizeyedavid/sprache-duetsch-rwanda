import type { ApplicationHistoryEntry,ApplicationStatus } from '../../lib/admissions-types';
import { STATUS_LABEL } from './constants';
import { dateTime,fullName } from './utils';

const ACTION_TEXT: Record<string, string> = {
  APPLICATION_STATUS_CHANGED: 'Status changed',
  APPLICATION_UPDATED: 'Course details edited',
  APPLICATION_STUDENT_LINKED: 'Student account linked',
};

const statusOf = (value: Record<string, unknown> | null): string | null => {
  const status = value?.status;
  return typeof status === 'string' && status in STATUS_LABEL ? STATUS_LABEL[status as ApplicationStatus] : null;
};

/** Audit trail for this application: who did what, when and why. */
export function ApplicationHistory({ history }: { history: ApplicationHistoryEntry[] }) {
  if (history.length === 0) return null;
  return (
    <section>
      <h3 className="text-sm font-semibold">History</h3>
      <ol className="mt-2 space-y-2 border-l border-line pl-4">
        {history.map((entry) => {
          const from = statusOf(entry.before);
          const to = statusOf(entry.after);
          return (
            <li key={entry.id} className="text-xs">
              <p className="font-medium">
                {ACTION_TEXT[entry.action] ?? entry.action}
                {from && to && from !== to ? `: ${from} → ${to}` : ''}
              </p>
              <p className="text-muted">{entry.actor ? fullName(entry.actor) : 'System'} · {dateTime(entry.createdAt)}</p>
              {entry.reason ? <p className="mt-0.5 italic">“{entry.reason}”</p> : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
