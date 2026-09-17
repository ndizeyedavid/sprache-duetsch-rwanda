import { addWeeks, format, parseISO, isValid } from 'date-fns';
import { FiRepeat } from 'react-icons/fi';

type Props = {
 enabled: boolean;
 onEnabled: (v: boolean) => void;
 count: number;
 onCount: (v: number) => void;
 date: string;
 startTime: string;
 endTime: string;
 disabled?: boolean;
};

export function RepeatField({ enabled, onEnabled, count, onCount, date, startTime, endTime, disabled }: Props) {
 const preview = (() => {
 if (!enabled || !date || !startTime || !endTime) return [];
 try {
 const base = parseISO(date);
 if (!isValid(base)) return [];
 return Array.from({ length: count }, (_, i) => {
 const d = addWeeks(base, i);
 return { label: format(d, 'EEE d MMM yyyy'), dateStr: format(d, 'yyyy-MM-dd'), time: `${startTime} → ${endTime}` };
 });
 } catch { return []; }
 })();

 return (
 <div className={`rounded-box border p-3 ${enabled ? 'border-brand/30 bg-brand-soft/40' : 'border-line bg-base-200/30'}`}>
 <label className="flex cursor-pointer items-center justify-between gap-3">
 <span className="flex items-center gap-2">
 <span className={`flex size-7 items-center justify-center rounded-full ${enabled ? 'bg-brand text-white' : 'bg-base-200 text-muted'}`}><FiRepeat aria-hidden className="text-xs" /></span>
 <span>
 <span className="block text-xs font-semibold leading-tight">Repeat weekly</span>
 <span className="block text-[11px] text-muted">Same time, same class — every week</span>
 </span>
 </span>
 <input type="checkbox" className="toggle toggle-sm border-line bg-base-100 [--tglbg:white] checked:bg-brand checked:border-brand" checked={enabled} disabled={disabled} onChange={(e) => onEnabled(e.currentTarget.checked)} />
 </label>

 {enabled ? (
 <div className="mt-3 space-y-3">
 <div className="flex flex-wrap items-center gap-2">
 <span className="text-xs font-medium">Repeat for</span>
 <select value={String(count)} onChange={(e) => onCount(Number(e.currentTarget.value))} disabled={disabled} className="select select-sm rounded-full border-line bg-base-100">
 {[2, 3, 4, 5, 6, 8, 10, 12].map((n) => <option key={n} value={n}>{n} weeks</option>)}
 </select>
 <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-brand">{count} sessions</span>
 </div>

 {preview.length > 0 ? (
 <div className="rounded-box border border-brand/20 bg-white p-2">
 <p className="px-1 pb-1 text-[11px] font-semibold text-muted">Preview — {preview.length} sessions will be created</p>
 <ul className="max-h-28 space-y-1 overflow-y-auto">
 {preview.map((p, i) => (
 <li key={p.dateStr} className="flex items-center justify-between gap-2 rounded-field bg-base-200/60 px-2.5 py-1.5 text-xs">
 <span className="flex items-center gap-2">
 <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{i + 1}</span>
 <span className="font-medium">{p.label}</span>
 </span>
 <span className="text-[11px] text-muted">{p.time}</span>
 </li>
 ))}
 </ul>
 <p className="px-1 pt-1.5 text-[11px] leading-snug text-muted">All sessions use the same class, title, mode and meeting link. You can edit or cancel any occurrence afterwards.</p>
 </div>
 ) : <p className="text-xs text-muted">Pick a date and times above to see the repeated dates.</p>}
 </div>
 ) : null}
 {disabled ? <p className="mt-2 text-[11px] text-muted">Repeating is only available when creating a new session.</p> : null}
 </div>
 );
}
