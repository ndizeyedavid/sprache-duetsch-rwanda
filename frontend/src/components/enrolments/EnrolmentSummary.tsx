import { FiLock,FiUserPlus,FiUsers,FiUserX } from "react-icons/fi";
import { AcademicMetricCard } from "../admin/AcademicMetricCard";
import type { EnrolmentFilters,RegisterStats } from "./types";

type Props = {
  stats: RegisterStats;
  filters: EnrolmentFilters;
  onToggle: (patch: Partial<EnrolmentFilters>) => void;
};

/** The four numbers admissions acts on; the last three filter the register to that list. */
export function EnrolmentSummary({ stats, filters, onToggle }: Props) {
  const unpaidOn = filters.access === "UNPAID";
  const neverOn = filters.activity === "NEVER_SIGNED_IN";
  return (
    <section aria-label="Register summary" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <AcademicMetricCard
        label="Active enrolments"
        value={stats.active}
        note={`${stats.total} records · ${stats.closed} completed or withdrawn`}
        icon={FiUsers}
        tone="success"
      />
      <AcademicMetricCard
        label="Awaiting class"
        value={stats.awaitingClass}
        note={stats.awaitingClass ? "Select to list them, then tick and assign" : "Every active enrolment has a class"}
        icon={FiUserPlus}
        tone="warning"
        onClick={() => onToggle({ awaitingOnly: !filters.awaitingOnly })}
        pressed={filters.awaitingOnly}
      />
      <AcademicMetricCard
        label="Course locked · unpaid"
        value={stats.unpaid}
        note={stats.unpaid ? "Lessons open once tuition is paid" : "Every active student has access"}
        icon={FiLock}
        tone="warning"
        onClick={() => onToggle({ access: unpaidOn ? "" : "UNPAID" })}
        pressed={unpaidOn}
      />
      <AcademicMetricCard
        label="Never signed in"
        value={stats.neverSignedIn}
        note={stats.neverSignedIn ? "Active students who have not logged in yet" : "Everyone has signed in"}
        icon={FiUserX}
        tone="info"
        onClick={() => onToggle({ activity: neverOn ? "" : "NEVER_SIGNED_IN" })}
        pressed={neverOn}
      />
    </section>
  );
}
