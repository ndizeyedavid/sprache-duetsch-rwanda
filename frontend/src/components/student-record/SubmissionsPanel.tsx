import { FiActivity } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { humanize } from '../../lib/services/humanize';
import { listStudentSubmissions } from '../../lib/services/list-student-submissions';
import { SectionState } from '../profile/SectionState';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { dateTime } from './utils';

/** Lesson activities (writing, speaking, exercises) the student handed in, newest first. */
export function SubmissionsPanel({ studentId }: { studentId: string }) {
  const submissions = useApi(`student-submissions-${studentId}`, () => listStudentSubmissions(studentId));
  const rows = submissions.data ?? [];

  return (
    <Panel>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FiActivity aria-hidden className="text-brand" />Lesson activities
        </h2>
        {rows.length ? <p className="text-xs text-muted">{rows.length} submitted</p> : null}
      </div>
      <div className="mt-3">
        <SectionState
          loading={submissions.loading}
          loadingLabel="Loading activities…"
          error={submissions.error}
          onRetry={submissions.refetch}
          isEmpty={!rows.length}
          emptyTitle="No activities submitted"
          emptyHint="Graded lesson activities appear here (practice drills are not listed)."
        >
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-muted"><th>Activity</th><th>Lesson</th><th>Score</th><th>Status</th><th>Submitted</th></tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td>
                      <p className="font-medium">{row.activity.title}</p>
                      <p className="text-xs text-muted">{humanize(row.activity.type)}{row.attemptNumber > 1 ? ` · try ${row.attemptNumber}` : ''}</p>
                    </td>
                    <td className="text-xs">
                      <span className="mr-1 font-bold text-brand">{row.activity.lesson.module.level.code}</span>{row.activity.lesson.title}
                    </td>
                    <td className="tabular-nums">{row.score === null ? '—' : `${row.score} / ${row.maxScore}`}</td>
                    <td><StatusBadge status={humanize(row.status)} className="px-3 py-1" /></td>
                    <td className="whitespace-nowrap text-xs text-muted">{dateTime(row.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionState>
      </div>
    </Panel>
  );
}
