import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import type { Dropout } from '../../lib/analytics-api';

/** Recent withdrawals, newest first, with the reason recorded on the enrolment change. */
export function DropoutList({ rows, days }: { rows: Dropout[]; days: number }) {
  if (!rows.length) return <p className="rounded-box bg-base-200 p-4 text-center text-xs text-muted">No withdrawals in the last {days} days.</p>;
  return (
    <ul className="divide-y divide-base-300">
      {rows.map(row => (
        <li key={row.enrollmentId} className="flex flex-wrap items-start justify-between gap-2 py-2.5">
          <div className="min-w-0">
            <Link to={`/admin/students/${row.student.id}`} className="link link-hover text-sm font-medium">
              {row.student.firstName} {row.student.lastName}
            </Link>
            <p className="text-xs text-muted">{row.student.studentCode} · {row.level} · {row.intake}{row.className ? ` · ${row.className}` : ''}</p>
            {row.reason ? <p className="mt-0.5 text-xs">Reason: {row.reason}</p> : null}
          </div>
          <span className="badge badge-ghost badge-sm whitespace-nowrap">Withdrawn {format(new Date(row.withdrawnAt), 'd MMM yyyy')}</span>
        </li>
      ))}
    </ul>
  );
}
