import { Area,AreaChart,ResponsiveContainer } from 'recharts';

type SparklineProps = {
 data: { value: number }[];
 color: string;
 fill?: string;
 height?: number;
 className?: string;
};

export function Sparkline({ data, color, fill, height = 56, className = '' }: SparklineProps) {

 return (
 <div className={className} style={{ height }} aria-hidden>
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
 <Area
 type="monotone"
 dataKey="value"
 stroke={color}
 strokeWidth={2.5}
 fillOpacity={1}
 fill={fill ?? color}
 dot={false}
 isAnimationActive={false}
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 );
}
