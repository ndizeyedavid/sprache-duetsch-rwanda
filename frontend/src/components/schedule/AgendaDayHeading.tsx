import { format,isToday,parseISO } from 'date-fns';
export function AgendaDayHeading({ date, label, count }: { date: string; label: string; count: number }) {
  const day = parseISO(date);
  return <div className="mb-3 flex items-center gap-3">
    <div className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl ${isToday(day) ? 'bg-secondary text-secondary-content' : 'bg-base-200 text-base-content'}`}><span className="text-[9px] font-semibold uppercase tracking-wider">{format(day, 'MMM')}</span><span className="text-lg font-bold leading-5">{format(day, 'd')}</span></div>
    <div><h3 className="text-sm font-semibold">{label}</h3><p className="mt-1 text-[11px] text-base-content/50">{count} class{count === 1 ? '' : 'es'} planned</p></div>
  </div>;
}
