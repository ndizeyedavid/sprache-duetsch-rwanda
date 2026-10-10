import {
FiAlertCircle,
FiCheckCircle,
FiRefreshCw,
FiUserCheck,
FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { AcademicDashboardHero } from "../../components/admin/AcademicDashboardHero";
import { AcademicEnrolmentChart } from "../../components/admin/AcademicEnrolmentChart";
import { AcademicMetricCard } from "../../components/admin/AcademicMetricCard";
import { AcademicOutcomes } from "../../components/admin/AcademicOutcomes";
import { AcademicReports } from "../../components/admin/AcademicReports";
import { AcademicSessions } from "../../components/admin/AcademicSessions";
import { ErrorBlock,LoadingBlock } from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { getAcademicDashboard } from "../../lib/services";
import { useSession } from "../../lib/session";

export function AdminDashboard() {
  const { user } = useSession();
  const navigate = useNavigate();
  const academic = useApi("academic-dashboard", getAcademicDashboard);
  if (academic.loading)
    return <LoadingBlock label="Loading academic overview…" />;
  if (academic.error || !academic.data)
    return (
      <ErrorBlock
        message={academic.error ?? "Could not load the dashboard."}
        onRetry={academic.refetch}
      />
    );
  const data = academic.data;
  return (
    <div className="journey-enter space-y-5">
      <AcademicDashboardHero firstName={user?.firstName} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
        </div>
        <button
          onClick={academic.refetch}
          disabled={academic.fetching}
          className="btn btn-ghost btn-sm rounded-full"
          aria-label="Refresh academic overview"
        >
          <FiRefreshCw
            aria-hidden
            className={academic.fetching ? "animate-spin" : ""}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <AcademicMetricCard
          label="Total learners"
          value={data.totalStudents}
          icon={FiUsers}
        />
        <AcademicMetricCard
          label="Active learners"
          value={data.activeStudents}
          icon={FiUserCheck}
          tone="success"
        />
        <AcademicMetricCard
          label="Needs follow-up"
          value={data.atRiskStudents}
          note="Review attendance"
          onClick={() => navigate("/admin/attendance")}
          icon={FiAlertCircle}
          tone="warning"
        />
        <AcademicMetricCard
          label="Completed"
          value={data.completed}
          icon={FiCheckCircle}
          tone="info"
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">
          <AcademicOutcomes data={data} />
          <AcademicEnrolmentChart data={data} />
        </div>
        <div className="min-w-0 space-y-5">
          <AcademicSessions />
          <AcademicReports />
        </div>
      </div>
    </div>
  );
}
