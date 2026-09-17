import { FiCheck } from 'react-icons/fi';
import { STATUSES, STATUS_META } from './constants';

type Props = {
 firstName: string;
 lastName: string;
 studentCode: string;
 current: string;
 savedStatus: string | null;
 onPick: (status: string) => void;
};

export function AttendanceRow({ firstName, lastName, studentCode, current, savedStatus, onPick }: Props) {
 const savedLabel = savedStatus ? (STATUS_META[savedStatus as keyof typeof STATUS_META]?.label ?? savedStatus) : '';
 const currentLabel = current ? (STATUS_META[current as keyof typeof STATUS_META]?.label ?? current) : '';
 return (
 <li className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-line bg-base-100 px-3 py-2.5 transition hover:border-brand/20 hover:">
 <div className="flex min-w-0 items-center gap-3">
 <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-xs font-bold">
 {firstName[0]}{lastName[0]}
 </span>
 <span className="min-w-0">
 <span className="block truncate text-sm font-semibold leading-tight">{firstName} {lastName}</span>
 <span className="block truncate text-[11px] text-muted">
 {studentCode}{savedStatus ? ` · Saved: ${savedLabel}` : current ? ` · ${currentLabel}` : ' · Not marked'}
 </span>
 </span>
 </div>
 <div className="flex flex-wrap items-center gap-1.5">
 {STATUSES.map((s) => {
 const meta = STATUS_META[s];
 const Icon = meta.icon;
 const active = current === s;
 return (
 <button
 key={s}
 type="button"
 aria-pressed={active}
 onClick={() => onPick(s)}
 className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${active ? meta.chip : 'border-line bg-base-100 text-muted hover:border-brand/20 hover:text-ink'}`}
 >
 <Icon aria-hidden className="text-sm" />
 {meta.label}
 {active ? <FiCheck aria-hidden className="text-xs" /> : null}
 </button>
 );
 })}
 </div>
 </li>
 );
}
