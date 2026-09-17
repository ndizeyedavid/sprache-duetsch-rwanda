import { useMemo, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { isoDate } from '../../lib/services';

type Row = { code: string; name: string; count: number; avg: number | null; passRate: number | null; lastAt: string | null };

type Props = { rows: Row[] };

type SortKey = 'name' | 'avg' | 'count' | 'passRate' | 'lastAt';
type Dir = 'asc' | 'desc';

export function StudentTable({ rows }: Props) {
  const [key, setKey] = useState<SortKey>('avg');
  const [dir, setDir] = useState<Dir>('desc');

  function toggle(k: SortKey) {
    if (key === k) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setKey(k); setDir(k === 'name' ? 'asc' : 'desc'); }
  }

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = a[key] as string | number | null;
      const vb = b[key] as string | number | null;
      if (va === null) return 1;
      if (vb === null) return -1;
      if (typeof va === 'string' && typeof vb === 'string') {
        const c = va.localeCompare(vb);
        return dir === 'asc' ? c : -c;
      }
      const n = (va as number) - (vb as number);
      return dir === 'asc' ? n : -n;
    });
    return copy;
  }, [rows, key, dir]);

  function head(label: string, k: SortKey) {
    const active = key === k;
    return (
      <button type="button" onClick={() => toggle(k)} className={`inline-flex items-center gap-1 text-xs font-semibold ${active ? 'text-brand' : 'text-muted hover:text-ink'}`}>
        {label}{active ? (dir === 'asc' ? <FiChevronUp aria-hidden className="text-xs" /> : <FiChevronDown aria-hidden className="text-xs" />) : null}
      </button>
    );
  }

  if (rows.length === 0) return <p className="py-8 text-center text-sm text-muted">No student data for this filter — try widening the date or clearing class/assessment.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="table w-full text-xs">
        <thead>
          <tr className="bg-base-200/60 text-muted">
            <th className="text-left">{head('Student', 'name')}</th>
            <th className="text-left">Code</th>
            <th className="text-center">{head('Submissions', 'count')}</th>
            <th className="text-center">{head('Avg', 'avg')}</th>
            <th className="text-center">{head('Pass', 'passRate')}</th>
            <th className="text-left">{head('Last', 'lastAt')}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.code} className="border-t border-line hover:bg-base-200/30">
              <td className="font-medium">{r.name}</td>
              <td className="font-mono text-[11px] text-muted">{r.code}</td>
              <td className="text-center">{r.count}</td>
              <td className="text-center">
                {r.avg === null ? <span className="text-muted">—</span> : <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${r.avg < 50 ? 'bg-coral-soft text-[#D8482F]' : r.avg < 70 ? 'bg-sun-soft text-[#8A6800]' : 'bg-brand-soft text-[#B30A00]'}`}>{r.avg}%</span>}
              </td>
              <td className="text-center">{r.passRate === null ? <span className="text-muted">—</span> : `${r.passRate}%`}</td>
              <td className="text-muted">{r.lastAt ? isoDate(r.lastAt) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
