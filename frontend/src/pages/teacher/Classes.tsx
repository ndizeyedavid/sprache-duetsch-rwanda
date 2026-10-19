import { FiArrowUpRight,FiCalendar,FiGrid } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { heroAction,heroGhost } from '../../components/hero/hero-actions';
import { PageHero } from '../../components/hero/PageHero';
import { classInsights } from '../../components/teacher/class-card/class-insights';
import { TeacherClassCard } from '../../components/teacher/class-card/TeacherClassCard';
import { loadTeachingOverview } from '../../components/teacher/dashboard-data';
import { useApi } from '../../hooks/useApi';
import { listClasses } from '../../lib/services';

export function TeacherClasses() {
  const classes = useApi('teacher-classes', listClasses);
  // Optional extras for the cards (work to review, next class); the page works without them.
  const overview = useApi('teaching-overview', loadTeachingOverview);
  const active = (classes.data ?? []).filter(group => group.isActive);
  const archived = (classes.data ?? []).filter(group => !group.isActive);
  const learners = active.reduce((total, group) => total + group._count.enrollments, 0);
  const hero = (
    <PageHero eyebrow="Teaching groups" icon={FiGrid} title="My classes" art="learners" scoped
      description="Your students, your teaching space. Open a class to see its people, attendance and work to grade."
      meta={classes.data ? <>
        <span className="hero-chip">{active.length} active {active.length === 1 ? 'class' : 'classes'}</span>
        <span className="hero-chip">{learners} {learners === 1 ? 'enrolment' : 'enrolments'}</span>
      </> : null}
      actions={<>
        <Link to="/teacher/schedule" className={heroAction}><FiCalendar aria-hidden />View schedule <FiArrowUpRight aria-hidden /></Link>
        <Link to="/teacher/attendance" className={heroGhost}>Attendance</Link>
      </>} />
  );
  if (classes.loading) return <div className="space-y-6">{hero}<LoadingBlock label="Loading your classes…" /></div>;
  if (classes.error || !classes.data) return <div className="space-y-6">{hero}<ErrorBlock message={classes.error ?? 'Could not load your classes.'} onRetry={classes.refetch} /></div>;
  return (
    <div className="space-y-6">
      {hero}
      {active.length ? <section aria-label="Active classes" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{active.map(group => <TeacherClassCard key={group.id} group={group} insights={overview.error ? null : classInsights(overview.data, group)} />)}</section> : <div className="card bg-base-100 p-8"><EmptyBlock title="No active classes yet" hint="Your assigned classes will appear here." /></div>}
      {archived.length ? <section><h2 className="mb-4 text-lg font-semibold text-muted">Past classes <span className="text-sm font-normal">({archived.length})</span></h2><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{archived.map(group => <TeacherClassCard key={group.id} group={group} insights={overview.error ? null : classInsights(overview.data, group)} />)}</div></section> : null}
    </div>
  );
}
