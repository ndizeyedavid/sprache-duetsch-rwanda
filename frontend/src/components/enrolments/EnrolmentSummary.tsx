import { FiCheckCircle,FiLayers,FiUserPlus,FiUsers } from "react-icons/fi";
import { AcademicMetricCard } from "../admin/AcademicMetricCard";
import type { RegisterStats } from "./types";

type Props = {
  stats: RegisterStats;
  awaitingActive: boolean;
  onToggleAwaiting: () => void;
};
export function EnrolmentSummary({
  stats,
  awaitingActive,
  onToggleAwaiting,
}: Props) {
  const share = stats.total
    ? Math.round((stats.active / stats.total) * 100)
    : 0;
  return (
    <section
      aria-label="Register summary"
      className="grid grid-cols-2 gap-3 xl:grid-cols-4"
    >
      <AcademicMetricCard
        label="Enrolment records"
        value={stats.total}
        note="Across the loaded intakes"
        icon={FiLayers}
      />
      <AcademicMetricCard
        label="Active enrolments"
        value={stats.active}
        note={`${share}% of the loaded register`}
        icon={FiUsers}
        tone="success"
      />
      <AcademicMetricCard
        label="Awaiting class"
        value={stats.awaitingClass}
        note={
          stats.awaitingClass
            ? "Select to review unassigned enrolments"
            : "Every active enrolment has a class"
        }
        icon={FiUserPlus}
        tone="warning"
        onClick={onToggleAwaiting}
        pressed={awaitingActive}
      />
      <AcademicMetricCard
        label="Closed enrolments"
        value={stats.closed}
        note="Completed or withdrawn records"
        icon={FiCheckCircle}
        tone="info"
      />
    </section>
  );
}
