import { FiClock,FiPauseCircle,FiUserCheck,FiUsers } from "react-icons/fi";
import { AcademicMetricCard } from "../admin/AcademicMetricCard";
import type { StaffStats } from "./types";

type Props = {
  stats: StaffStats;
  suspendedActive: boolean;
  onToggleSuspended: () => void;
};
export function StaffSummary({
  stats,
  suspendedActive,
  onToggleSuspended,
}: Props) {
  return (
    <section
      aria-label="Staff summary"
      className="grid grid-cols-2 gap-3 xl:grid-cols-4"
    >
      <AcademicMetricCard
        label="Staff accounts"
        value={stats.total}
        note={`${stats.active} active accounts`}
        icon={FiUsers}
      />
      <AcademicMetricCard
        label="Pending activation"
        value={stats.pending}
        note="Created accounts awaiting activation"
        icon={FiUserCheck}
        tone="success"
      />
      <AcademicMetricCard
        label="Suspended"
        value={stats.suspended}
        note="Select to filter the staff register"
        icon={FiPauseCircle}
        tone="warning"
        onClick={onToggleSuspended}
        pressed={suspendedActive}
      />
      <AcademicMetricCard
        label="Never signed in"
        value={stats.neverSignedIn}
        note="No first sign-in recorded yet"
        icon={FiClock}
        tone="info"
      />
    </section>
  );
}
