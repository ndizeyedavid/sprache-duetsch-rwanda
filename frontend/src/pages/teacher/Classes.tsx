import { Link } from 'react-router-dom';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { humanize, listClasses, listLevels } from '../../lib/services';

export function TeacherClasses() {
  const classes = useApi('teacher-classes', listClasses);
  const levels = useApi('levels-catalog', listLevels);

  const levelCode = (levelId: string): string =>
    levels.data?.find((level) => level.id === levelId)?.code ?? '—';

  return (
    <Panel>
      <SectionHeader title={`My Classes (${classes.data?.length ?? 0})`} action={{ label: 'Schedule', to: '/teacher/schedule' }} />
      {classes.loading ? (
        <LoadingBlock label="Loading your classes…" />
      ) : classes.error || !classes.data ? (
        <ErrorBlock message={classes.error ?? 'Could not load your classes.'} onRetry={classes.refetch} />
      ) : classes.data.length === 0 ? (
        <EmptyBlock
          title="No classes assigned yet"
          hint="An academic admin will assign you to a class group. It will then appear here."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.data.map((group) => (
            <article key={group.id} className="card-shadow rounded-box bg-base-100 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                  {levelCode(group.levelId)}
                </p>
                <StatusBadge status={humanize(group.shift)} />
              </div>
              <h3 className="mt-1 text-sm font-semibold leading-snug">{group.name}</h3>
              <p className="mt-0.5 text-xs text-muted">Class code · {group.code}</p>
              <div className="mt-4 flex gap-2">
                <Link
                  to="/teacher/attendance"
                  className="btn btn-sm grow rounded-full border-0 bg-brand text-white hover:bg-brand/90"
                >
                  Attendance
                </Link>
                <Link
                  to="/teacher/grading"
                  className="btn btn-sm grow rounded-full border-brand bg-transparent text-brand hover:border-brand hover:bg-brand hover:text-white"
                >
                  Grading
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}
