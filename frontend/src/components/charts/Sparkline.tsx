import { Area, AreaChart, ResponsiveContainer } from 'recharts';

type SparklineProps = {
  data: { value: number }[];
  color: string;
  fill?: string;
  height?: number;
  className?: string;
};

export function Sparkline({ data, color, fill, height = 56, className = '' }: SparklineProps) {
  const gradientId = `spark-${color.replace('#', '')}`;

  return (
    <div className={className} style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill ?? color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={fill ?? color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
