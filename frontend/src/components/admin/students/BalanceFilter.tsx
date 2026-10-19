import type { StudentRow } from '../../../lib/services/student-row';
import { balanceOf,matchesBalance,type BalanceFilter as Filter } from '../../payments/quick-pay/quick-pay';

const OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' }, { value: 'owing', label: 'Owing' }, { value: 'overdue', label: 'Overdue' }, { value: 'paid', label: 'Fully paid' },
];

/** Finance pills: who still owes, who is overdue, who is settled — with live counts. */
export function BalanceFilter({ rows, value, onChange }: { rows: StudentRow[]; value: Filter; onChange: (value: Filter) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by balance">
      {OPTIONS.map((o) => {
        const count = o.value === 'all' ? rows.length : rows.filter((row) => matchesBalance(balanceOf(row), o.value)).length;
        return (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
            className={`btn btn-xs h-8 rounded-full px-3 ${value === o.value ? 'btn-primary' : 'border-line bg-base-100'}`}>{o.label} {count}</button>
        );
      })}
    </div>
  );
}
