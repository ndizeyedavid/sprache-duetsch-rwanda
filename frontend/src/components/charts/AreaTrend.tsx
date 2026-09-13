import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS } from '../../lib/theme';
import { ChartTooltip } from './ChartTooltip';
import type { TrendDatum, TrendSeries } from './LineTrend';

type AreaTrendProps = {
  data: TrendDatum[];
  xKey: string;
  series: TrendSeries[];
  height?: number;
  suffix?: string;
  showLegend?: boolean;
};

export function AreaTrend({
  data,
  xKey,
  series,
  height = 240,
  suffix = '',
  showLegend = false,
}: AreaTrendProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            {series.map((entry) => (
              <linearGradient key={entry.key} id={`fill-${entry.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={entry.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke={COLORS.grid} strokeDasharray="4 4" />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} tick={{ fill: COLORS.muted, fontSize: 11 }} dy={8} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: COLORS.muted, fontSize: 11 }} width={38} />
          <Tooltip content={<ChartTooltip suffix={suffix} />} cursor={{ stroke: COLORS.grid }} />
          {showLegend ? <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /> : null}
          {series.map((entry) => (
            <Area
              key={entry.key}
              type="monotone"
              dataKey={entry.key}
              name={entry.label}
              stroke={entry.color}
              strokeWidth={2.5}
              fill={`url(#fill-${entry.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
