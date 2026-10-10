import { FiCalendar } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { getStudentAttendance } from '../../lib/services/get-student-attendance';
import { humanize } from '../../lib/services/humanize';
import type { StudentDetail } from '../../lib/services/student-detail';
import { SectionState } from '../profile/SectionState';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { AttendanceSummaryCard } from './AttendanceSummaryCard';
import { dateTime } from './utils';

type Props = { studentId: string; summary: StudentDetail['attendance'] };

export function AttendanceTab({ studentId, summary }: Props) {
  const history = useApi(`student-attendance-${studentId}`, () => getStudentAttendance(studentId));
  const rows = history.data?.attendance ?? [];

  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <AttendanceSummaryCard summary={history.data?.summary ?? summary} />
      <Panel className="lg:col-span-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FiCalendar aria-hidden className="text-brand" />Session history
        </h2>
        <div className="mt-3">
          <SectionState
            loading={history.loading}
            loadingLabel="Loading sessions…"
            error={history.error}
            onRetry={history.refetch}
            isEmpty={!rows.length}
            emptyTitle="No attendance marked yet"
            emptyHint="Sessions appear once a teacher takes the register."
          >
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead><tr className="text-muted"><th>Session</th><th>Class</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-t border-line">
                      <td>
                        <p className="font-medium">{row.session.title}</p>
                        {row.note ? <p className="text-xs text-muted">{row.note}</p> : null}
                      </td>
                      <td className="text-xs">{row.session.classGroup?.name ?? '—'}</td>
                      <td className="whitespace-nowrap text-xs text-muted">{dateTime(row.session.startAt)}</td>
                      <td><StatusBadge status={humanize(row.status)} className="px-3 py-1" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionState>
        </div>
      </Panel>
    </div>
  );
}
