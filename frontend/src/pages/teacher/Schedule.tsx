import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { ScheduleCard } from '../../components/cards/ScheduleCard';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { photos } from '../../lib/images';
import { createSession, isoDate, isoTime, listClasses, listSessions } from '../../lib/services';
import { sessionStatusLabel, sessionTone, teacherName } from '../../lib/sessions-ui';

const AVATARS = [photos.clarisse, photos.nadine, photos.jeanPaul, photos.aline, photos.eric];
const MODES = ['ONLINE', 'ONSITE', 'HYBRID'] as const;
const PROVIDERS = ['GOOGLE_MEET', 'ZOOM', 'MICROSOFT_TEAMS', 'OTHER'] as const;

export function TeacherSchedule() {
  const sessions = useApi('teacher-sessions', listSessions);
  const classes = useApi('teacher-classes', listClasses);

  const [classGroupId, setClassGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [mode, setMode] = useState<string>('ONLINE');
  const [provider, setProvider] = useState<string>('GOOGLE_MEET');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const list = sessions.data ?? [];
  const upcoming = list
    .filter((session) => ['SCHEDULED', 'LIVE', 'RESCHEDULED'].includes(session.status))
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  const past = list.filter((session) => session.status === 'COMPLETED').slice(0, 8);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!classGroupId) {
      setFormError('Choose one of your classes first.');
      return;
    }
    setSaving(true);
    try {
      await createSession({
        classGroupId,
        title: title.trim() || undefined,
        startAt,
        endAt,
        mode,
        provider,
        meetingUrl: meetingUrl.trim() || undefined,
      });
      setTitle('');
      setStartAt('');
      setEndAt('');
      setMeetingUrl('');
      sessions.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not schedule the session.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <Panel>
        <SectionHeader title="Schedule a live class" />
        <form onSubmit={handleCreate} className="grid gap-3 lg:grid-cols-3">
          <select required value={classGroupId} onChange={(e) => setClassGroupId(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Class">
            <option value="">My class…</option>
            {(classes.data ?? []).map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Session title" className="input input-sm w-full rounded-field border-line bg-base-200" />
          <div className="grid grid-cols-2 gap-2">
            <select value={mode} onChange={(e) => setMode(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Mode">
              {MODES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select value={provider} onChange={(e) => setProvider(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Provider">
              {PROVIDERS.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          <label className="block">
            <span className="mb-1 block text-[11px] text-muted">Starts</span>
            <input required type="datetime-local" value={startAt} onChange={(e) => setStartAt(e.target.value)} className="input input-sm w-full rounded-field border-line bg-base-200" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[11px] text-muted">Ends</span>
            <input required type="datetime-local" value={endAt} onChange={(e) => setEndAt(e.target.value)} className="input input-sm w-full rounded-field border-line bg-base-200" />
          </label>
          <input value={meetingUrl} onChange={(e) => setMeetingUrl(e.target.value)} placeholder="Meeting link (required for online)" className="input input-sm w-full rounded-field border-line bg-base-200" />
          {formError ? (
            <p role="alert" className="text-xs font-medium text-error lg:col-span-3">
              {formError}
            </p>
          ) : null}
          <div className="lg:col-span-3">
            <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
              {saving ? <span className="loading loading-spinner loading-sm" /> : 'Schedule session'}
            </button>
          </div>
        </form>
      </Panel>

      <Panel>
        <SectionHeader title="Upcoming sessions" />
        {sessions.loading ? (
          <LoadingBlock label="Loading sessions…" />
        ) : sessions.error ? (
          <ErrorBlock message={sessions.error} onRetry={sessions.refetch} />
        ) : upcoming.length === 0 ? (
          <EmptyBlock title="Nothing scheduled" hint="Create a live class with the form above." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((session, index) => (
              <div key={session.id} className="space-y-2">
                <ScheduleCard
                  title={session.title}
                  teacher={teacherName(session.teacher)}
                  photo={AVATARS[index % AVATARS.length]}
                  date={isoDate(session.startAt)}
                  time={`${isoTime(session.startAt)} – ${isoTime(session.endAt)}`}
                  tone={sessionTone(session.status)}
                  status={sessionStatusLabel(session.status)}
                />
                {session.meetingUrl ? (
                  <a
                    href={session.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90"
                  >
                    Open meeting link
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <SectionHeader title="Recently completed" />
        {past.length === 0 ? (
          <EmptyBlock title="No completed sessions yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {past.map((session, index) => (
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
  );
}
