import type { ApplicationRow } from '../../lib/admissions-types';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { SOURCE_LABEL } from './constants';
import { courseLabel,fullName,shortDate } from './utils';

type Props = { rows: ApplicationRow[]; onOpen: (id: string) => void };

/** Table on desktop, tappable cards on phones; both open the review drawer. */
export function ApplicationList({ rows, onOpen }: Props) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="table table-sm">
          <thead>
            <tr className="text-xs text-muted">
              <th>Reference</th><th>Applicant</th><th>Course</th><th>Campus</th><th>Source</th><th>Received</th><th>Status</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-base-200/60">
                <td className="font-mono text-xs">{row.reference}</td>
                <td>
                  <p className="font-medium">{fullName(row)}</p>
                  <p className="text-xs text-muted">{row.email}</p>
                </td>
                <td className="text-sm">{courseLabel(row)}</td>
                <td className="text-sm">{row.campus?.name ?? '—'}</td>
                <td className="text-xs">{SOURCE_LABEL[row.source]}</td>
                <td className="whitespace-nowrap text-xs">{shortDate(row.createdAt)}</td>
                <td><ApplicationStatusBadge status={row.status} /></td>
                <td>
                  <button type="button" className="btn btn-ghost btn-xs rounded-full text-brand" onClick={() => onOpen(row.id)}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <button type="button" onClick={() => onOpen(row.id)} className="w-full rounded-box border border-line bg-base-100 p-4 text-left">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{fullName(row)}</p>
                  <p className="font-mono text-xs text-muted">{row.reference}</p>
                </div>
                <ApplicationStatusBadge status={row.status} />
              </div>
              <p className="mt-2 text-sm">{courseLabel(row)}</p>
              <p className="mt-1 text-xs text-muted">{SOURCE_LABEL[row.source]} · {shortDate(row.createdAt)}{row.campus ? ` · ${row.campus.name}` : ''}</p>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
