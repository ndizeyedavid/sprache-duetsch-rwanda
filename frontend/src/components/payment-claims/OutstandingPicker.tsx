import { useState } from 'react';
import type { OutstandingRow } from '../../lib/payment-claims';
import { money } from '../../lib/services/money';
import { amountLabel } from './utils';

export type PickedStudent = { id: string; name: string; code: string; balance: number; currency: string };

type Props = { rows: OutstandingRow[]; loading: boolean; error: string | null; value: PickedStudent | null; onChange: (student: PickedStudent | null) => void };

const pick = (row: OutstandingRow): PickedStudent => ({
  id: row.studentId, name: `${row.student.user.firstName} ${row.student.user.lastName}`, code: row.student.studentCode,
  balance: money(row.balance), currency: row.currency,
});

/** Searchable list of students who still owe money, largest balance first. */
export function OutstandingPicker({ rows, loading, error, value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const visible = rows
    .filter((row) => !needle || `${row.student.user.firstName} ${row.student.user.lastName} ${row.student.studentCode} ${row.student.user.email}`.toLowerCase().includes(needle))
    .sort((a, b) => money(b.balance) - money(a.balance));
  return (
    <div className="space-y-2">
      <label className="block"><span className="mb-1.5 block text-xs font-medium">Student</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or student ID" className="input w-full" /></label>
      <ul className="max-h-52 overflow-y-auto rounded-box border border-line" aria-label="Students with a balance">
        {loading ? <li className="p-3 text-xs text-muted">Loading balances…</li> : null}
        {error ? <li role="alert" className="p-3 text-xs text-error">{error}</li> : null}
        {!loading && !error && !visible.length ? <li className="p-3 text-xs text-muted">No student with a balance matches.</li> : null}
        {visible.map((row) => {
          const active = value?.id === row.studentId;
          return (
            <li key={row.studentId}>
              <button type="button" onClick={() => onChange(active ? null : pick(row))} aria-pressed={active}
                className={`flex w-full items-center justify-between gap-3 border-t border-line px-3 py-2 text-left text-xs first:border-t-0 ${active ? 'bg-brand-tint' : 'hover:bg-base-200'}`}>
                <span className="min-w-0"><span className="block truncate font-semibold">{row.student.user.firstName} {row.student.user.lastName}</span>
                  <span className="font-mono text-[0.6875rem] text-muted">{row.student.studentCode}</span></span>
                <span className="shrink-0 text-right"><span className="block font-semibold">{amountLabel(row.balance, row.currency)}</span>
                  {money(row.overdueAmount) > 0 ? <span className="text-[0.625rem] text-error">overdue</span> : null}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
