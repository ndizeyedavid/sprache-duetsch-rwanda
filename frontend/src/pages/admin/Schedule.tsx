import { useState } from 'react';
import type { FormEvent } from 'react';
import { MonthCalendar } from '../../components/ui/Calendar';
import type { CalendarEvent } from '../../components/ui/Calendar';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { ScheduleCard } from '../../components/cards/ScheduleCard';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { photos } from '../../lib/images';
import {
  createSession,
  isoDate,
  isoTime,
  listClasses,
  listSessions,
  listTeachers,
} from '../../lib/services';
import { sessionStatusLabel, sessionTone, teacherName } from '../../lib/sessions-ui';

const AVATARS = [photos.clarisse, photos.nadine, photos.jeanPaul, photos.aline, photos.eric];

export function AdminSchedule() {
  const sessions = useApi('all-sessions', listSessions);
  const classes = useApi('class-groups', listClasses);
  const teachers = useApi('teachers', listTeachers);

  const [classGroupId, setClassGroupId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const list = sessions.data ?? [];
  const events: CalendarEvent[] = list.map((session) => ({
    day: new Date(session.startAt).getDate(),
    label: session.title,
    tone: sessionTone(session.status),
    time: isoTime(session.startAt),
  }));

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!classGroupId) {
      setFormError('Choose a class group first.');
      return;
    }
    setSaving(true);
    try {
      await createSession({
        classGroupId,
        title: title.trim() || undefined,
        mode: 'ONLINE',
        provider: 'GOOGLE_MEET',
        meetingUrl: meetingUrl.trim() || undefined,
        startAt,
        endAt,
        teacherId: teacherId || undefined,
      });
      setTitle('');
      setStartAt('');
      setEndAt('');
      setMeetingUrl('');
      sessions.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not create the session.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="space-y-5 xl:col-span-8">
        <Panel>
          <SectionHeader title="Month view" />
          {sessions.loading ? (
            <LoadingBlock label="Loading sessions…" />
          ) : sessions.error ? (
            <ErrorBlock message={sessions.error} onRetry={sessions.refetch} />
          ) : (
            <MonthCalendar events={events} />
          )}
        </Panel>

        <Panel>
          <SectionHeader title="All sessions" />
          {sessions.loading ? (
            <LoadingBlock label="Loading sessions…" />
          ) : sessions.error ? (
            <ErrorBlock message={sessions.error} onRetry={sessions.refetch} />
          ) : list.length === 0 ? (
            <EmptyBlock title="No sessions yet" hint="Schedule the first live class with the form." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {list.slice(0, 12).map((session, index) => (
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

      <div className="xl:col-span-4">
        <Panel>
          <SectionHeader title="New session" />
          <form onSubmit={handleCreate} className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Class group</span>
              <select
                required
                value={classGroupId}
                onChange={(event) => setClassGroupId(event.target.value)}
                className="select w-full rounded-field border-line bg-base-200"
              >
                <option value="">Choose…</option>
                {(classes.data ?? []).map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.code})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Teacher (optional)</span>
              <select
                value={teacherId}
                onChange={(event) => setTeacherId(event.target.value)}
                className="select w-full rounded-field border-line bg-base-200"
              >
                <option value="">Auto</option>
                {(teachers.data ?? []).map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </label>
            <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Session title" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium">Starts</span>
                <input required type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} className="input input-sm w-full rounded-field border-line bg-base-200" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-medium">Ends</span>
                <input required type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} className="input input-sm w-full rounded-field border-line bg-base-200" />
              </label>
            </div>
            <input value={meetingUrl} onChange={(event) => setMeetingUrl(event.target.value)} placeholder="Meeting link (Meet/Zoom)" className="input input-sm w-full rounded-field border-line bg-base-200" />
            {formError ? (
              <p role="alert" className="text-xs font-medium text-error">
                {formError}
              </p>
            ) : null}
            <button type="submit" disabled={saving} className="btn w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
              {saving ? <span className="loading loading-spinner loading-sm" /> : null}
              Schedule session
            </button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
