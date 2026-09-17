import { num } from '../../lib/format';

type LegendRowProps = {
 label: string;
 value: number;
 color: string;
 suffix?: string;
 className?: string;
};

/** Dot + label + value row that sits under every donut chart. */
export function LegendRow({ label, value, color, suffix = '', className = '' }: LegendRowProps) {
 return (
 <div className={`flex items-center gap-3 ${className}`}>
 <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
 <span className="grow truncate text-xs text-muted">{label}</span>
 <span className="text-xs font-semibold text-ink">
 {num(value)}
 {suffix}
 </span>
 </div>
 );
}
