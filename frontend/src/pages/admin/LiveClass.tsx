import { useState } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage, downloadFile } from '../../lib/api';
import {
  getSession,
  getSessionRoster,
  humanize,
  isoDate,
  isoTime,
  listSessions,
  markSessionAttendance,
} from '../../lib/services';
import { teacherName } from '../../lib/sessions-ui';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;

export function AdminLiveClass() {
  const sessions = useApi('all-sessions', listSessions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const detail = useApi(`session-${selectedId ?? 'none'}`, () => getSession(selectedId ?? ''));
  const roster = useApi(`roster-${selectedId ?? 'none'}`, () => getSessionRoster(selectedId ?? ''));

  function pick(id: string) {
    setSelectedId(id);
    setMarks({});
    setSaved(false);
    setActionError(null);
  }

  async function handleSave() {
    if (!selectedId) return;
    const records = Object.entries(marks).map(([studentId, status]) => ({ studentId, status }));
    if (records.length === 0) {
      setActionError('Mark at least one student first.');
      return;
    }
    setActionError(null);
    setSaving(true);
    try {
      await markSessionAttendance(selectedId, records);
      setSaved(true);
      roster.refetch();
    } catch (err) {
      setActionError(apiErrorMessage(err, 'Could not save attendance.'));
    } finally {
      setSaving(false);
    }
  }

  const list = sessions.data ?? [];
  const session = selectedId ? detail.data : null;
  const rows = roster.data ?? [];

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel className="lg:col-span-1">
        <SectionHeader title="Sessions" />
        {sessions.loading ? (
          <LoadingBlock label="Loading sessions…" />
        ) : sessions.error || !sessions.data ? (
          <ErrorBlock message={sessions.error ?? 'Could not load sessions.'} onRetry={sessions.refetch} />
        ) : list.length === 0 ? (
          <EmptyBlock title="No sessions yet" />
        ) : (
          <ul className="space-y-2">
            {list.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => pick(item.id)}
                  className={`w-full rounded-field p-3 text-left transition-colors ${
                    selectedId === item.id ? 'bg-brand-tint' : 'bg-base-200 hover:bg-brand-tint/60'
                  }`}
                >
                  <span className="block truncate text-xs font-semibold">{item.title}</span>
                  <span className="mt-1 block text-[11px] text-muted">
                    {isoDate(item.startAt)} · {isoTime(item.startAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="lg:col-span-2">
        {!selectedId ? (
          <EmptyBlock title="Select a session" hint="Pick a session on the left to open its live-class view and roster." />
        ) : detail.loading ? (
          <LoadingBlock label="Loading session…" />
        ) : detail.error || !detail.data ? (
          <ErrorBlock message={detail.error ?? 'Could not load this session.'} onRetry={detail.refetch} />
        ) : (
          <article>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-lg font-semibold">{session?.title}</h1>
              <StatusBadge status={humanize(session?.status)} />
            </div>
            <p className="mt-1 text-xs text-muted">
              {session ? `${isoDate(session.startAt)} · ${isoTime(session.startAt)} – ${isoTime(session.endAt)}` : ''}
              {session?.teacher ? ` · ${teacherName(session.teacher)}` : ''}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {session?.meetingUrl ? (
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90"
                >
                  Open meeting link
                </a>
              ) : null}
              {session?.classGroup ? (
                <button
                  type="button"
                  onClick={() =>
                    downloadFile(
                      `/attendance/export?classGroupId=${session.classGroup!.id}`,
                      `attendance-${session.classGroup!.name}.csv`,
                    ).catch((err: unknown) =>
                      setActionError(apiErrorMessage(err, 'Could not export attendance.')),
                    )
                  }
                  className="btn btn-sm rounded-full border-line bg-base-200"
                >
                  Export class CSV
                </button>
              ) : null}
            </div>

            <h2 className="mt-6 text-sm font-semibold">Roster & attendance</h2>
            {roster.loading ? (
              <LoadingBlock label="Loading roster…" />
            ) : roster.error ? (
              <ErrorBlock message={roster.error} onRetry={roster.refetch} />
            ) : rows.length === 0 ? (
              <EmptyBlock title="Empty roster" hint="No students are assigned to this class group." />
            ) : (
              <ul className="mt-2 space-y-2">
                {rows.map((row) => (
                  <li key={row.studentId} className="flex flex-wrap items-center justify-between gap-3 rounded-field bg-base-200 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">
                        {row.firstName} {row.lastName}
                      </p>
                      <p className="text-[11px] text-muted">
                        {row.studentCode}
                        {row.status ? ` · Marked ${humanize(row.status)}` : ''}
                      </p>
                    </div>
                    <select
                      aria-label={`Attendance for ${row.firstName} ${row.lastName}`}
                      value={marks[row.studentId] ?? ''}
                      onChange={(event) =>
                        setMarks((current) => ({ ...current, [row.studentId]: event.target.value }))
                      }
                      className="select select-sm rounded-field border-line bg-base-100"
                    >
                      <option value="">Mark…</option>
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {humanize(status)}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            )}

            {actionError ? (
              <p role="alert" className="mt-3 text-xs font-medium text-error">
                {actionError}
              </p>
            ) : null}
            {saved ? (
              <p role="status" className="mt-3 text-xs font-medium text-brand">
                Attendance saved.
              </p>
            ) : null}
            <button
              type="button"
              disabled={saving || rows.length === 0}
              onClick={handleSave}
              className="btn btn-sm mt-4 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
            >
              {saving ? <span className="loading loading-spinner loading-sm" /> : null}
              Save attendance
            </button>
          </article>
        )}
      </Panel>
    </div>
  );
}
