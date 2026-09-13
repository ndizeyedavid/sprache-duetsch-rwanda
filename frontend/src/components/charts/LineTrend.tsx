import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS } from '../../lib/theme';
import { ChartTooltip } from './ChartTooltip';

export type TrendSeries = { key: string; label: string; color: string };
export type TrendDatum = Record<string, string | number>;

type LineTrendProps = {
  data: TrendDatum[];
  xKey: string;
  series: TrendSeries[];
  height?: number;
  suffix?: string;
  showLegend?: boolean;
  showGrid?: boolean;
};

export function LineTrend({
  data,
  xKey,
  series,
  height = 260,
  suffix = '',
  showLegend = false,
  showGrid = true,
}: LineTrendProps) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          {showGrid ? <CartesianGrid vertical={false} stroke={COLORS.grid} strokeDasharray="4 4" /> : null}
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            dy={8}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: COLORS.muted, fontSize: 11 }} width={38} />
          <Tooltip content={<ChartTooltip suffix={suffix} />} cursor={{ stroke: COLORS.grid }} />
          {showLegend ? <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /> : null}
          {series.map((entry) => (
            <Line
              key={entry.key}
              type="monotone"
              dataKey={entry.key}
              name={entry.label}
              stroke={entry.color}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
