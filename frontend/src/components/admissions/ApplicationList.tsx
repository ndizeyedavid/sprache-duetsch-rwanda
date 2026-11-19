import type { ApplicationRow } from '../../lib/admissions-types';
import { ApplicationStatusBadge } from './ApplicationStatusBadge';
import { ContactLinks } from './ContactLinks';
import { SOURCE_LABEL } from './constants';
import { MatchBadges } from './MatchBadges';
import { courseLabel,fullName,shortDate } from './utils';

type Props = { rows: ApplicationRow[]; onOpen: (id: string) => void; selected: Set<string>; onSelect: (ids: string[], checked: boolean) => void };

/** Table on desktop, tappable cards on phones; both open the review drawer. Ticked rows get bulk actions. */
export function ApplicationList({ rows, onOpen, selected, onSelect }: Props) {
  const allChecked = rows.length > 0 && rows.every((row) => selected.has(row.id));
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="table table-sm">
          <thead>
            <tr className="text-xs text-muted">
              <th className="w-8"><input type="checkbox" className="checkbox checkbox-xs" aria-label="Select all applications on this page" checked={allChecked}
                onChange={(event) => onSelect(rows.map((row) => row.id), event.currentTarget.checked)} /></th>
              <th>Reference</th><th>Applicant</th><th>Contact</th><th>Course</th><th>Campus</th><th>Source</th><th>Received</th><th>Status</th><th />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={`hover:bg-base-200/60 ${selected.has(row.id) ? 'bg-base-200/70' : ''}`}>
                <td><input type="checkbox" className="checkbox checkbox-xs" aria-label={`Select ${row.reference}`} checked={selected.has(row.id)}
                  onChange={(event) => onSelect([row.id], event.currentTarget.checked)} /></td>
                <td className="font-mono text-xs">{row.reference}</td>
                <td>
                  <p className="font-medium">{fullName(row)}</p>
                  <p className="text-xs text-muted">{row.email}</p>
                  <MatchBadges matches={row.matches} />
                </td>
                <td>
                  {row.phone ? <p className="whitespace-nowrap text-xs">{row.phone}</p> : null}
                  <ContactLinks phone={row.phone} email={row.email} compact />
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
          <li key={row.id} className={`rounded-box border p-4 ${selected.has(row.id) ? 'border-primary bg-base-200/70' : 'border-line bg-base-100'}`}>
            <div className="flex items-start justify-between gap-2">
              <label className="flex items-start gap-2">
                <input type="checkbox" className="checkbox checkbox-xs mt-1" aria-label={`Select ${row.reference}`} checked={selected.has(row.id)}
                  onChange={(event) => onSelect([row.id], event.currentTarget.checked)} />
                <span>
                  <span className="block font-medium">{fullName(row)}</span>
                  <span className="block font-mono text-xs text-muted">{row.reference}</span>
                </span>
              </label>
              <ApplicationStatusBadge status={row.status} />
            </div>
            <MatchBadges matches={row.matches} />
            <p className="mt-2 text-sm">{courseLabel(row)}</p>
            <p className="mt-1 text-xs text-muted">{SOURCE_LABEL[row.source]} · {shortDate(row.createdAt)}{row.campus ? ` · ${row.campus.name}` : ''}{row.phone ? ` · ${row.phone}` : ''}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <ContactLinks phone={row.phone} email={row.email} compact />
              <button type="button" onClick={() => onOpen(row.id)} className="btn btn-sm rounded-full border-line bg-base-200 text-xs">Review</button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
