import type { CSSProperties } from "react";
import { FiAward } from "react-icons/fi";
import type { AcademicDashboard } from "../../lib/services";
import { Panel,SectionHeader } from "../ui/Panel";

export function AcademicOutcomes({ data }: { data: AcademicDashboard }) {
  const rates = [
    {
      label: "Attendance",
      value: data.attendanceRate,
      note: "Present or late",
      color: "text-info",
    },
    {
      label: "Pass rate",
      value: data.passRate,
      note: "Graded attempts",
      color: "text-success",
    },
    {
      label: "Lesson completion",
      value: data.completionRate,
      note: "Completed a lesson",
      color: "text-secondary",
    },
  ];
  return (
    <Panel>
      <SectionHeader
        title="Outcomes"
        action={{ label: "Attendance", to: "/admin/attendance" }}
      />
      <div className="grid gap-5 sm:grid-cols-3">
        {rates.map((rate) => (
          <div
            key={rate.label}
            className="flex items-center gap-4 rounded-box bg-base-200/50 p-4 sm:flex-col sm:text-center"
          >
            <div
              className={`radial-progress shrink-0 ${rate.color}`}
              role="progressbar"
              aria-label={rate.label}
              aria-valuenow={rate.value}
              aria-valuemin={0}
              aria-valuemax={100}
              style={
                {
                  "--value": Math.min(100, Math.max(0, rate.value)),
                  "--size": "5rem",
                  "--thickness": "6px",
                } as CSSProperties
              }
            >
              <span className="text-base font-semibold text-base-content">
                {rate.value}%
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold">{rate.label}</h3>
              <p className="mt-1 text-[11px] leading-5 text-base-content/55">
                {rate.note}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-base-300/60 pt-4 text-xs text-base-content/60">
        <span className="flex items-center gap-2">
          <FiAward aria-hidden />
          Average graded score{" "}
          <strong className="text-base-content">{data.averageScore}</strong>
        </span>
      </div>
    </Panel>
  );
}
