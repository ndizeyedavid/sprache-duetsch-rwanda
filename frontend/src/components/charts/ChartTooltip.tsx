type TooltipEntry = {
 name?: string;
 value?: string | number;
 color?: string;
 dataKey?: string | number;
};

type ChartTooltipProps = {
 active?: boolean;
 payload?: TooltipEntry[];
 label?: string | number;
 prefix?: string;
 suffix?: string;
};

/** Navy tooltip bubble that matches the mockup's chart hover state. */
export function ChartTooltip({ active, payload, label, prefix = '', suffix = '' }: ChartTooltipProps) {
 if (!active || !payload?.length) return null;

 return (
 <div className="rounded-xl bg-night px-3 py-2 text-xs text-white">
 {label !== undefined && label !== '' ? <p className="mb-1 font-semibold">{label}</p> : null}
 {payload.map((entry) => (
 <p key={String(entry.dataKey ?? entry.name)} className="flex items-center gap-2 whitespace-nowrap">
 <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
 <span className="font-medium">{entry.name}</span>
 <span className="text-white/80">
 {prefix}
 {entry.value}
 {suffix}
 </span>
 </p>
 ))}
 </div>
 );
}
