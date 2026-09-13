import type { ReactNode } from 'react';
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../lib/theme';

type RadialStatProps = {
  value: number;
  size?: number;
  color?: string;
  trackColor?: string;
  thickness?: number;
  children?: ReactNode;
  className?: string;
};

/** Circular percentage gauge used by "My Progress" and the profile course rings. */
export function RadialStat({
  value,
  size = 160,
  color = COLORS.brand,
  trackColor = COLORS.brandSoft,
  thickness = 12,
  children,
  className = '',
}: RadialStatProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const outer = 100;
  const inner = outer - thickness;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={[{ name: 'progress', value: clamped }]}
          innerRadius={`${inner}%`}
          outerRadius={`${outer}%`}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar
            dataKey="value"
            background={{ fill: trackColor }}
            cornerRadius={999}
            fill={color}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
