import { STATUSES, STATUS_META } from './constants';

type Props = { onPick: (status: string) => void; onClear: () => void; disabled?: boolean };

export function BulkBar({ onPick, onClear, disabled }: Props) {
 return (
 <div className="flex flex-wrap items-center gap-2 rounded-box border border-line bg-base-200/40 p-2">
 <span className="px-2 text-xs font-semibold">Mark all</span>
 {STATUSES.map((s) => {
 const meta = STATUS_META[s];
 const Icon = meta.icon;
 return (
 <button key={s} type="button" disabled={disabled} onClick={() => onPick(s)} className="btn btn-xs gap-1 rounded-full border-line bg-base-100 hover:border-brand/20 disabled:opacity-40">
 <Icon aria-hidden className="text-xs" />
 {meta.label}
 </button>
 );
 })}
 <button type="button" onClick={onClear} className="btn btn-ghost btn-xs rounded-full">Clear</button>
 </div>
 );
}
