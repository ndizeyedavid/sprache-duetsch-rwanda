import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartTooltip } from './ChartTooltip';

export type DonutSlice = { name: string; value: number; color: string };

type DonutChartProps = {
 data: DonutSlice[];
 height?: number;
 innerRadius?: number;
 outerRadius?: number;
 suffix?: string;
 children?: React.ReactNode;
};

export function DonutChart({
 data,
 height = 220,
 innerRadius = 62,
 outerRadius = 92,
 suffix = '%',
 children,
}: DonutChartProps) {
 return (
 <div className="relative" style={{ height }}>
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Tooltip content={<ChartTooltip suffix={suffix} />} />
 <Pie
 data={data}
 dataKey="value"
 nameKey="name"
 innerRadius={innerRadius}
 outerRadius={outerRadius}
 paddingAngle={3}
 stroke="none"
 startAngle={90}
 endAngle={-270}
 >
 {data.map((entry) => (
 <Cell key={entry.name} fill={entry.color} />
 ))}
 </Pie>
 </PieChart>
 </ResponsiveContainer>
 {children ? (
 <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
 {children}
 </div>
 ) : null}
 </div>
 );
}
