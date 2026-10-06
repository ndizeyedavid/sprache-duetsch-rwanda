import { FiBookOpen } from "react-icons/fi";
import { useApi } from "../../hooks/useApi";
import type { AcademicDashboard } from "../../lib/services";
import { listLevels } from "../../lib/services";
import { COLORS } from "../../lib/theme";
import { GroupedBar } from "../charts/GroupedBar";
import { EmptyBlock,ErrorBlock } from "../common/PageState";
import { Panel,SectionHeader } from "../ui/Panel";

export function AcademicEnrolmentChart({ data }: { data: AcademicDashboard }) {
  const levels = useApi("academic-chart-levels", listLevels);
  const total = data.byLevel.reduce((sum, row) => sum + row.count, 0);
  const bars = data.byLevel.map((row) => ({
    level: levels.data?.find((l) => l.id === row.levelId)?.code ?? "Level",
    students: row.count,
  }));
  return (
    <Panel>
      <SectionHeader
        title="Enrolments by level"
        action={{ label: "Enrolments", to: "/admin/enrolments" }}
      />
      <div className="mb-3 flex items-center gap-2 text-xs text-base-content/60">
        <FiBookOpen aria-hidden />
        <strong className="text-base-content">{total}</strong> active enrolments
        across {data.byLevel.length} levels
      </div>
      {levels.error ? (
        <ErrorBlock message={levels.error} onRetry={levels.refetch} />
      ) : !bars.length ? (
        <EmptyBlock
          title="Build your first learning cohort"
          hint="Enrol a student in a level to see its distribution here."
        />
      ) : (
        <GroupedBar
          data={bars}
          xKey="level"
          barSize={36}
          series={[
            { key: "students", label: "Enrolments", color: COLORS.brand },
          ]}
          height={240}
        />
      )}
    </Panel>
  );
}
