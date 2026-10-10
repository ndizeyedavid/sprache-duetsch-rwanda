import { AcademicCourseActions } from "../../components/admin/AcademicCourseActions";
import {
EmptyBlock,
ErrorBlock,
LoadingBlock,
} from "../../components/common/PageState";
import { TeacherCourseWorkspace } from "../../components/curriculum/TeacherCourseWorkspace";
import { useApi } from "../../hooks/useApi";
import { listLevels } from "../../lib/services";

export function AdminCourses() {
  const levels = useApi("admin-levels", listLevels);
  if (levels.loading) return <LoadingBlock label="Loading curriculum…" />;
  if (levels.error || !levels.data)
    return (
      <ErrorBlock
        message={levels.error ?? "Could not load levels."}
        onRetry={levels.refetch}
      />
    );
  return (
    <div className="space-y-5">
      <AcademicCourseActions levels={levels.data} onChanged={levels.refetch} />
      {levels.data.length ? (
        <TeacherCourseWorkspace levels={levels.data} academic />
      ) : (
        <EmptyBlock
          title="No learning levels yet"
          hint="Create a level to start building its curriculum."
        />
      )}
    </div>
  );
}
