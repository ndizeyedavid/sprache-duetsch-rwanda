import { FiCalendar,FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { TeacherClassDetailCard } from '../../components/teacher/TeacherClassDetailCard';
import { useApi } from '../../hooks/useApi';
import { listClasses } from '../../lib/services';

export function TeacherClasses() {
  const classes = useApi('teacher-classes', listClasses);
  if (classes.loading) return <LoadingBlock label="Loading your classes…" />;
  if (classes.error || !classes.data) return <ErrorBlock message={classes.error ?? 'Could not load your classes.'} onRetry={classes.refetch} />;
  const active = classes.data.filter(group => group.isActive);
  const archived = classes.data.filter(group => !group.isActive);
  return (
    <div className="space-y-6">
      <header className="card overflow-hidden bg-base-100">
        <div className="flex items-center justify-between gap-4 p-6 sm:p-8">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold sm:text-3xl">My Classes</h1>
            <p className="mt-2 text-sm text-muted">Your students. Your teaching space.</p>
            <Link to="/teacher/schedule" className="btn btn-sm mt-5"><FiCalendar aria-hidden />View schedule</Link>
          </div>
          <img src="/illustrations/study-books.webp" alt="" width={160} height={140} className="w-24 object-contain sm:w-40" />
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 bg-base-200 px-6 py-4 text-sm sm:px-8">
          <span><strong>{active.length}</strong> active {active.length === 1 ? 'class' : 'classes'}</span>
          <span className="inline-flex items-center gap-2"><FiUsers aria-hidden /><strong>{active.reduce((total, group) => total + group._count.enrollments, 0)}</strong> enrollments</span>
        </div>
      </header>
      {active.length ? <section aria-label="Active classes" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{active.map(group => <TeacherClassDetailCard key={group.id} group={group} />)}</section> : <div className="card bg-base-100 p-8"><EmptyBlock title="No active classes yet" hint="Your assigned classes will appear here." /></div>}
      {archived.length ? <section><h2 className="mb-4 text-lg font-semibold text-muted">Past classes <span className="text-sm font-normal">({archived.length})</span></h2><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{archived.map(group => <TeacherClassDetailCard key={group.id} group={group} />)}</div></section> : null}
    </div>
  );
}
