import { useState } from 'react';
import { FiBookOpen, FiClock, FiDownload, FiTrendingUp, FiUsers } from 'react-icons/fi';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatTile } from '../../components/ui/StatTile';
import { GroupedBar } from '../../components/charts/GroupedBar';
import { ScheduleCard } from '../../components/cards/ScheduleCard';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage, downloadFile } from '../../lib/api';
import { COLORS } from '../../lib/theme';
import { photos } from '../../lib/images';
import { rwf } from '../../lib/format';
import {
  getAcademicDashboard,
  getFinanceReportSummary,
  isoDate,
  isoTime,
  listLevels,
  listSessions,
  money,
} from '../../lib/services';
import { sessionStatusLabel, sessionTone, teacherName } from '../../lib/sessions-ui';

const AVATARS = [photos.clarisse, photos.nadine, photos.jeanPaul, photos.aline, photos.eric];

export function AdminDashboard() {
  const academic = useApi('academic-dashboard', getAcademicDashboard);
  const finance = useApi('finance-summary', getFinanceReportSummary);
  const sessions = useApi('all-sessions', listSessions);
  const levels = useApi('levels-catalog', listLevels);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  if (academic.loading) return <LoadingBlock label="Loading academic overview…" />;
  if (academic.error || !academic.data) {
    return <ErrorBlock message={academic.error ?? 'Could not load the dashboard.'} onRetry={academic.refetch} />;
  }

  const data = academic.data;

  async function handleExport(key: string, path: string, filename: string) {
    setExportError(null);
    setExporting(key);
    try {
      await downloadFile(path, filename);
    } catch (err) {
      setExportError(apiErrorMessage(err, `Could not export ${filename}.`));
    } finally {
      setExporting(null);
    }
  }

  const levelName = (id: string): string =>
    levels.data?.find((level) => level.id === id)?.code ?? id.slice(0, 8);
  const enrolmentBars = data.byLevel.map((row) => ({ level: levelName(row.levelId), students: row.count }));
  const upcomingSessions = (sessions.data ?? [])
    .filter((session) => ['SCHEDULED', 'LIVE', 'RESCHEDULED'].includes(session.status))
    .slice(0, 4);

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="space-y-5 xl:col-span-8">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatTile label="Total students" value={String(data.totalStudents)} tone="brand" variant="solid" icon={FiUsers} />
          <StatTile label="Active students" value={String(data.activeStudents)} tone="sun" variant="solid" icon={FiTrendingUp} />
          <StatTile label="At-risk students" value={String(data.atRiskStudents)} tone="coral" variant="solid" icon={FiClock} />
          <StatTile label="New registrations" value={String(data.newRegistrations)} tone="navy" variant="solid" icon={FiBookOpen} />
        </div>

        <Panel>
          <SectionHeader title="Enrolments by level" />
          {enrolmentBars.length === 0 ? (
            <EmptyBlock title="No active enrolments" hint="Enrolments appear here once students are assigned to levels." />
          ) : (
            <GroupedBar
              data={enrolmentBars}
              xKey="level"
              barSize={26}
              series={[{ key: 'students', label: 'Students', color: COLORS.brand }]}
              height={240}
            />
          )}
        </Panel>

        <div className="grid gap-4 sm:grid-cols-3">
          <Panel>
            <p className="text-[11px] text-muted">Attendance rate</p>
            <p className="mt-1 text-2xl font-semibold">{data.attendanceRate}%</p>
          </Panel>
          <Panel>
            <p className="text-[11px] text-muted">Pass rate</p>
            <p className="mt-1 text-2xl font-semibold">{data.passRate}%</p>
          </Panel>
          <Panel>
            <p className="text-[11px] text-muted">Average score</p>
            <p className="mt-1 text-2xl font-semibold">{data.averageScore}</p>
          </Panel>
        </div>

        <Panel>
          <SectionHeader title="Finance" action={{ label: 'Transactions', to: '/admin/transactions' }} />
          {finance.loading ? (
            <LoadingBlock label="Loading finance…" />
          ) : finance.error || !finance.data ? (
            <p className="text-xs text-muted">
              Finance figures need a finance role. {finance.error ?? ''}
            </p>
          ) : (
            <dl className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-field bg-base-200 p-3">
                <dt className="text-[11px] text-muted">Billed</dt>
                <dd className="mt-1 font-semibold">{rwf(money(finance.data.totalBilled))}</dd>
              </div>
              <div className="rounded-field bg-base-200 p-3">
                <dt className="text-[11px] text-muted">Collected</dt>
                <dd className="mt-1 font-semibold text-brand">{rwf(money(finance.data.totalCollected))}</dd>
              </div>
              <div className="rounded-field bg-base-200 p-3">
                <dt className="text-[11px] text-muted">Outstanding</dt>
                <dd className="mt-1 font-semibold">{rwf(money(finance.data.totalOutstanding))}</dd>
              </div>
            </dl>
          )}
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <SectionHeader title="Reports" />
          <div className="grid gap-2">
            {[
              { key: 'students', label: 'Students CSV', path: '/students/export?pageSize=100', file: 'students.csv' },
              { key: 'payments', label: 'Payments CSV', path: '/payments/export?pageSize=100', file: 'payments.csv' },
              { key: 'attendance', label: 'Attendance CSV', path: '/attendance/export', file: 'attendance.csv' },
              { key: 'grades', label: 'Grades CSV', path: '/assessments/attempts/export', file: 'attempts.csv' },
            ].map((report) => (
              <button
                key={report.key}
                type="button"
                disabled={exporting !== null}
                onClick={() => handleExport(report.key, report.path, report.file)}
                className="btn btn-sm justify-start gap-2 rounded-full border-line bg-base-200 disabled:opacity-60"
              >
                <FiDownload aria-hidden />
                {exporting === report.key ? 'Exporting…' : report.label}
              </button>
            ))}
          </div>
          {exportError ? (
            <p role="alert" className="mt-2 text-xs font-medium text-error">
              {exportError}
            </p>
          ) : null}
        </Panel>

        <Panel>
          <SectionHeader title="Upcoming sessions" action={{ label: 'Schedule', to: '/admin/schedule' }} />
          {sessions.loading ? (
            <LoadingBlock label="Loading sessions…" />
          ) : sessions.error ? (
            <ErrorBlock message={sessions.error} onRetry={sessions.refetch} />
          ) : upcomingSessions.length === 0 ? (
            <EmptyBlock title="Nothing scheduled" hint="Create a session from the schedule page." />
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session, index) => (
                <ScheduleCard
                  key={session.id}
                  title={session.title}
                  teacher={teacherName(session.teacher)}
                  photo={AVATARS[index % AVATARS.length]}
                  date={isoDate(session.startAt)}
                  time={`${isoTime(session.startAt)} – ${isoTime(session.endAt)}`}
                  tone={sessionTone(session.status)}
                  status={sessionStatusLabel(session.status)}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
