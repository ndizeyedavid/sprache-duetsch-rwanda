import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COLORS } from '../../lib/theme';
import { ChartTooltip } from './ChartTooltip';
import type { TrendDatum, TrendSeries } from './LineTrend';

type GroupedBarProps = {
  data: TrendDatum[];
  xKey: string;
  series: TrendSeries[];
  /** `horizontal` = upright columns, `vertical` = sideways bars. */
  layout?: 'horizontal' | 'vertical';
  height?: number;
  stacked?: boolean;
  suffix?: string;
  showLegend?: boolean;
  barSize?: number;
  radius?: number;
};

export function GroupedBar({
  data,
  xKey,
  series,
  layout = 'horizontal',
  height = 260,
  stacked = false,
  suffix = '',
  showLegend = false,
  barSize = 14,
  radius = 6,
}: GroupedBarProps) {
  const vertical = layout === 'vertical';

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 8, right: 12, bottom: 0, left: vertical ? 8 : -18 }}
          barGap={stacked ? 0 : 4}
        >
          <CartesianGrid horizontal={!vertical} vertical={vertical} stroke={COLORS.grid} strokeDasharray="4 4" />
          <XAxis
            type={vertical ? 'number' : 'category'}
            dataKey={vertical ? undefined : xKey}
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            dy={8}
            hide={vertical}
          />
          <YAxis
            type={vertical ? 'category' : 'number'}
            dataKey={vertical ? xKey : undefined}
            tickLine={false}
            axisLine={false}
            tick={{ fill: COLORS.muted, fontSize: 11 }}
            width={vertical ? 52 : 38}
          />
          <Tooltip content={<ChartTooltip suffix={suffix} />} cursor={{ fill: 'rgba(55,69,87,0.04)' }} />
          {showLegend ? <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /> : null}
          {series.map((entry) => (
            <Bar
              key={entry.key}
              dataKey={entry.key}
              name={entry.label}
              fill={entry.color}
              stackId={stacked ? 'stack' : undefined}
              barSize={barSize}
              radius={vertical ? [0, radius, radius, 0] : [radius, radius, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
