import { useState } from 'react';
import { FiArrowUpRight,FiAward } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { DashboardAttendanceCard } from '../../components/student/DashboardAttendanceCard';
import { DashboardClassCard } from '../../components/student/DashboardClassCard';
import { DashboardCoursePanel } from '../../components/student/DashboardCoursePanel';
import { DashboardQuickNav } from '../../components/student/DashboardQuickNav';
import { DashboardSkillsCard } from '../../components/student/DashboardSkillsCard';
import { DashboardWeekPanel } from '../../components/student/DashboardWeekPanel';
import { LearningJourneyHero } from '../../components/student/LearningJourneyHero';
import { useApi } from '../../hooks/useApi';
import { getMyCourses,getMySkills,getStudentDashboard } from '../../lib/services';
import { useSession } from '../../lib/session';

export function Dashboard() {
  const { user } = useSession();
  const dashboard = useApi('student-dashboard', getStudentDashboard);
  const courses = useApi('my-courses', getMyCourses);
  const skills = useApi('my-skills', getMySkills);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  if (dashboard.loading) return <LoadingBlock label="Loading your dashboard…" />;
  if (dashboard.error || !dashboard.data) return <ErrorBlock message={dashboard.error ?? 'Could not load dashboard.'} onRetry={dashboard.refetch} />;
  const data = dashboard.data;
  const courseList = courses.data ?? [];
  const selected = courseList.find((course) => course.level.id === selectedId)
    ?? courseList.find((course) => course.level.id === data.currentLevel?.id) ?? courseList[0];

  return (
    <div className="journey-enter space-y-4">
      <LearningJourneyHero firstName={user?.firstName} course={selected} />
      <DashboardQuickNav />
      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          {courses.loading ? <section className="card learning-panel p-6"><LoadingBlock label="Loading courses…" /></section>
            : courses.error ? <section className="card learning-panel p-6"><ErrorBlock message={courses.error} onRetry={courses.refetch} /></section>
              : selected ? <DashboardCoursePanel courses={courseList} course={selected} onSelect={setSelectedId} />
                : <section className="card learning-panel p-6"><EmptyBlock title="Your courses will appear here" hint="Your academic admin will enrol you in a level." /></section>}
        </div>
        <div className="min-w-0">
          {courses.loading ? <section className="card learning-panel h-full p-6"><LoadingBlock label="Loading progress…" /></section>
            : courses.error ? null : <DashboardWeekPanel courses={courseList} />}
        </div>
        <div className="min-w-0">
            {skills.loading ? <section className="card learning-panel p-6"><LoadingBlock label="Loading skills…" /></section>
              : skills.error ? <section className="card learning-panel p-6"><ErrorBlock message={skills.error} onRetry={skills.refetch} /></section>
                : <DashboardSkillsCard skills={skills.data ?? []} />}
        </div>
        <DashboardAttendanceCard attendance={data.attendance} />
        <DashboardClassCard session={data.upcomingClass} />
          {data.nextExam ? <Link to="/assignments" className="card learning-panel flex-row items-center gap-3 p-4 lg:col-span-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/10"><FiAward aria-hidden /></span><div className="min-w-0 flex-1"><p className="text-[10px] text-base-content/60">Next assessment</p><p className="mt-1 text-xs font-semibold">{data.nextExam.title}</p></div><FiArrowUpRight aria-hidden /></Link> : null}
      </div>
    </div>
  );
}
