import { STATUS_CHIP_CLASS } from './constants';

type Props = { counts: Record<string, number>; total: number; rate: number };

export function StatsStrip({ counts, total, rate }: Props) {
 return (
 <div className="flex flex-wrap items-center gap-2 text-xs">
 <span className="rounded-full bg-base-200 px-3 py-1 font-medium">{total} students</span>
 <span className={`rounded-full border px-3 py-1 font-medium ${rate < 75 ? 'bg-coral-soft text-[#D8482F] border-coral/20' : 'bg-brand-soft text-[#B30A00] border-brand/20'}`}>{rate}% present</span>
 <span className={`rounded-full border px-2.5 py-1 font-medium ${STATUS_CHIP_CLASS.PRESENT}`}>P: {counts.PRESENT}</span>
 <span className={`rounded-full border px-2.5 py-1 font-medium ${STATUS_CHIP_CLASS.LATE}`}>L: {counts.LATE}</span>
 <span className={`rounded-full border px-2.5 py-1 font-medium ${STATUS_CHIP_CLASS.ABSENT}`}>A: {counts.ABSENT}</span>
 <span className={`rounded-full border px-2.5 py-1 font-medium ${STATUS_CHIP_CLASS.EXCUSED}`}>E: {counts.EXCUSED}</span>
 {counts.UNMARKED ? <span className="rounded-full bg-base-200 px-2.5 py-1 font-medium text-muted">{counts.UNMARKED} unmarked</span> : null}
 </div>
 );
}
