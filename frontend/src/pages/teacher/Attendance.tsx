import { useState } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import {
  getSessionRoster,
  humanize,
  isoDate,
  isoTime,
  listSessions,
  markSessionAttendance,
} from '../../lib/services';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;

export function TeacherAttendance() {
  const sessions = useApi('teacher-sessions', listSessions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const roster = useApi(
    `roster-${selectedId ?? 'none'}`,
    () => getSessionRoster(selectedId ?? ''),
    selectedId !== null,
  );

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
  const rows = roster.data ?? [];
  const selected = list.find((session) => session.id === selectedId) ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel className="lg:col-span-1">
        <SectionHeader title="My sessions" />
        {sessions.loading ? (
          <LoadingBlock label="Loading sessions…" />
        ) : sessions.error || !sessions.data ? (
          <ErrorBlock message={sessions.error ?? 'Could not load sessions.'} onRetry={sessions.refetch} />
        ) : list.length === 0 ? (
          <EmptyBlock title="No sessions yet" />
        ) : (
          <ul className="space-y-2">
            {list.map((session) => (
              <li key={session.id}>
                <button
                  type="button"
                  onClick={() => pick(session.id)}
                  className={`w-full rounded-field p-3 text-left transition-colors ${
                    selectedId === session.id ? 'bg-brand-tint' : 'bg-base-200 hover:bg-brand-tint/60'
                  }`}
                >
                  <span className="block truncate text-xs font-semibold">{session.title}</span>
                  <span className="mt-1 block text-[11px] text-muted">
                    {isoDate(session.startAt)} · {isoTime(session.startAt)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel className="lg:col-span-2">
        {!selectedId ? (
          <EmptyBlock title="Select a session" hint="Pick a session on the left, then mark Present, Absent, Late or Excused." />
        ) : roster.loading ? (
          <LoadingBlock label="Loading roster…" />
        ) : roster.error ? (
          <ErrorBlock message={roster.error} onRetry={roster.refetch} />
        ) : (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-base font-semibold">{selected?.title}</h1>
              {selected ? <StatusBadge status={humanize(selected.status)} /> : null}
            </div>
            {rows.length === 0 ? (
              <div className="mt-4">
                <EmptyBlock title="Empty roster" hint="No students are assigned to this class group." />
              </div>
            ) : (
              <ul className="mt-4 space-y-2">
                {rows.map((row) => (
                  <li
                    key={row.studentId}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-field bg-base-200 px-3 py-2"
                  >
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
          </div>
        )}
      </Panel>
    </div>
  );
}
