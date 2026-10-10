import type { CSSProperties } from "react";

export function AcademicRateGauge({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      className="radial-progress text-success"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      style={
        {
          "--value": Math.min(100, Math.max(0, value)),
          "--size": "7rem",
          "--thickness": "8px",
        } as CSSProperties
      }
    >
      <span className="text-2xl font-semibold text-base-content">{value}%</span>
    </div>
  );
}
