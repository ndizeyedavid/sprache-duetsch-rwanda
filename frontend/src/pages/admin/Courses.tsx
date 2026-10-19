import { FiArrowLeft } from "react-icons/fi";
import { Link,useSearchParams } from "react-router-dom";
import { AcademicCourseActions } from "../../components/admin/AcademicCourseActions";
import { EmptyBlock,ErrorBlock,LoadingBlock } from "../../components/common/PageState";
import { CourseCatalogue } from "../../components/curriculum/catalogue/CourseCatalogue";
import { CoursesHero } from "../../components/curriculum/catalogue/CoursesHero";
import { TeacherCourseWorkspace } from "../../components/curriculum/TeacherCourseWorkspace";
import { heroGhost } from "../../components/hero/hero-actions";
import { useApi } from "../../hooks/useApi";
import { listLevels } from "../../lib/services";

/** Course catalogue (one card per level); choosing a course opens its studio (`?level=`). */
export function AdminCourses() {
  const levels = useApi("admin-levels", listLevels);
  const [params, setParams] = useSearchParams();
  if (levels.loading) return <div className="space-y-6"><CoursesHero /><LoadingBlock label="Loading courses…" /></div>;
  if (levels.error || !levels.data) {
    return <div className="space-y-6"><CoursesHero /><ErrorBlock message={levels.error ?? "Could not load levels."} onRetry={levels.refetch} /></div>;
  }
  const chosen = params.get("level");
  if (chosen && levels.data.some((level) => level.id === chosen || level.code === chosen)) {
    const actions = <>
      <Link to="/admin/courses" className={heroGhost}><FiArrowLeft aria-hidden />All courses</Link>
      <AcademicCourseActions levels={levels.data} onChanged={levels.refetch} />
    </>;
    return <TeacherCourseWorkspace levels={levels.data} academic actions={actions} />;
  }
  const hero = <CoursesHero levels={levels.data} actions={<AcademicCourseActions levels={levels.data} onChanged={levels.refetch} createOnly />} />;
  if (!levels.data.length) {
    return <div className="space-y-6">{hero}<EmptyBlock title="No courses yet" hint="Create a level to start building its curriculum." /></div>;
  }
  return (
    <div className="space-y-6">
      {hero}
      <CourseCatalogue levels={levels.data} onOpen={(level) => { setParams({ level: level.id }); window.scrollTo({ top: 0 }); }} />
    </div>
  );
}
