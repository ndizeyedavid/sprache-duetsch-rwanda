import { addMinutes,differenceInMinutes,format } from 'date-fns';
import type { FormEvent } from 'react';
import { useEffect,useState } from 'react';
import { apiErrorMessage } from '../../../lib/api';
import { createSession,updateSession } from '../../../lib/services';

export type EditingSession = { id: string; title: string; classGroupId: string; startAt: string; endAt: string; mode: string; provider: string | null; meetingUrl: string | null; room: string | null; notes: string | null; recordingUrl?: string | null; status?: string };
type Options = { open: boolean; editing?: EditingSession | null; classes: { id: string }[]; initialDate?: string | null; onSaved: () => void; onClose: () => void };

const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** The schedule shows 08:00–22:00, so classes are booked inside that window (HH:mm strings compare in order). */
export const withinSchoolHours = (start: string, end: string) => start >= '08:00' && end <= '22:00' && start < end;

/** Classes can never be booked (or moved) into the past; `date`/`start` are the form's local values. */
export const startsInPast = (date: string, start: string, now: Date = new Date()) =>
  Boolean(date && start) && new Date(`${date}T${start}:00`).getTime() <= now.getTime();

/** Form state for creating/editing a live class; resets each time the editor opens. */
export function useSessionDraft({ open, editing, classes, initialDate, onSaved, onClose }: Options) {
  const [classId, setClass] = useState(''), [title, setTitle] = useState(''), [date, setDate] = useState('');
  const [start, setStart] = useState('09:00'), [end, setEnd] = useState('10:30');
  const [mode, setMode] = useState('ONLINE'), [provider, setProvider] = useState('GOOGLE_MEET'), [link, setLink] = useState('');
  const [room, setRoom] = useState(''), [notes, setNotes] = useState(''), [recording, setRecording] = useState('');
  const [repeat, setRepeat] = useState(false), [weeks, setWeeks] = useState(4), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const locked = Boolean(editing && (['COMPLETED', 'CANCELLED'].includes(editing.status ?? '') || Date.parse(editing.endAt) < Date.now()));

  useEffect(() => {
    if (!open) return;
    // A clicked time-grid slot arrives as "yyyy-MM-ddTHH:mm"; a plain date keeps the 09:00 default.
    const slot = initialDate && initialDate.length > 10 ? new Date(initialDate) : null;
    setError(''); setClass(editing?.classGroupId ?? classes[0]?.id ?? ''); setTitle(editing?.title ?? '');
    setDate(editing ? format(new Date(editing.startAt), 'yyyy-MM-dd') : initialDate?.slice(0, 10) ?? '');
    setStart(editing ? format(new Date(editing.startAt), 'HH:mm') : slot ? format(slot, 'HH:mm') : '09:00');
    setEnd(editing ? format(new Date(editing.endAt), 'HH:mm') : slot ? format(addMinutes(slot, 90), 'HH:mm') : '10:30');
    setMode(editing?.mode ?? 'ONLINE'); setProvider(editing?.provider ?? 'GOOGLE_MEET'); setLink(editing?.meetingUrl ?? '');
    setRoom(editing?.room ?? ''); setNotes(editing?.notes ?? ''); setRecording(editing?.recordingUrl ?? ''); setRepeat(false); setWeeks(4);
  }, [open, editing, classes, initialDate]);

  // New classes, and edits that change the time, must start in the future (the API refuses otherwise).
  const changesTime = !editing || date !== format(new Date(editing.startAt), 'yyyy-MM-dd') || start !== format(new Date(editing.startAt), 'HH:mm') || end !== format(new Date(editing.endAt), 'HH:mm');
  const inPast = !locked && changesTime && startsInPast(date, start);
  const minutes = date && start && end ? differenceInMinutes(new Date(`${date}T${end}:00`), new Date(`${date}T${start}:00`)) : 0;

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setSaving(true);
    try {
      const metadata = { notes: notes.trim(), recordingUrl: recording.trim() || null };
      if (locked && editing) await updateSession(editing.id, metadata);
      else {
        const startAt = new Date(`${date}T${start}:00`).toISOString(), endAt = new Date(`${date}T${end}:00`).toISOString();
        if (startAt >= endAt) throw Error('End must be after start.');
        const payload = { ...metadata, title: title.trim(), startAt, endAt, mode, provider, meetingUrl: link.trim() || null, room: room.trim(), timezone: zone() };
        const moved = !editing || Date.parse(startAt) !== Date.parse(editing.startAt) || Date.parse(endAt) !== Date.parse(editing.endAt);
        // Only new or moved classes must fit the 08:00–22:00 day; older bookings can still be edited.
        if (moved && startsInPast(date, start)) throw Error('This time has already passed — classes can only be scheduled in the future.');
        if (moved && !withinSchoolHours(start, end)) throw Error('Classes run between 08:00 and 22:00 — pick a time in that window.');
        if (editing) {
          await updateSession(editing.id, { ...payload, ...(!moved ? { startAt: undefined, endAt: undefined } : {}) });
        } else await createSession({ ...payload, classGroupId: classId, repeatWeeks: repeat ? weeks : 1 });
      }
      onSaved(); onClose();
    } catch (err) {
      setError(apiErrorMessage(err, err instanceof Error ? err.message : 'Could not save session.'));
    } finally { setSaving(false); }
  }

  return {
    values: { classId, title, date, start, end, mode, provider, link, room, notes, recording, repeat, weeks },
    set: { setClass, setTitle, setDate, setStart, setEnd, setMode, setProvider, setLink, setRoom, setNotes, setRecording, setRepeat, setWeeks },
    locked, saving, error, minutes, inPast, zone: zone(), submit,
  };
}

export type SessionDraft = ReturnType<typeof useSessionDraft>;
