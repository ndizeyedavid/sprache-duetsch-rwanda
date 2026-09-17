import { addWeeks, format, parseISO } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { FiAlertCircle, FiCheck, FiClock, FiX } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import { createSession, updateSession } from '../../lib/services';
import { MODE_OPTIONS, PROVIDER_OPTIONS } from './constants';
import { RepeatField } from './RepeatField';

type ClassItem = { id: string; name: string; code: string };
type Props = {
 open: boolean;
 onClose: () => void;
 classes: ClassItem[];
 editing?: {
 id: string;
 title: string;
 classGroupId: string;
 startAt: string;
 endAt: string;
 mode: string;
 provider: string | null;
 meetingUrl: string | null;
 room: string | null;
 notes: string | null;
 } | null;
 initialDate?: string | null;
 onSaved: () => void;
};

function isoToDate(iso: string): string {
 const d = new Date(iso);
 const pad = (n: number) => String(n).padStart(2, '0');
 return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function isoToTime(iso: string): string {
 const d = new Date(iso);
 const pad = (n: number) => String(n).padStart(2, '0');
 return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function combine(date: string, time: string): string {
 return new Date(`${date}T${time}:00`).toISOString();
}

export function SessionEditorModal({ open, onClose, classes, editing, initialDate, onSaved }: Props) {
 const isEdit = Boolean(editing);
 const [classGroupId, setClassGroupId] = useState('');
 const [title, setTitle] = useState('');
 const [date, setDate] = useState('');
 const [startTime, setStartTime] = useState('');
 const [endTime, setEndTime] = useState('');
 const [mode, setMode] = useState('ONLINE');
 const [provider, setProvider] = useState('GOOGLE_MEET');
 const [meetingUrl, setMeetingUrl] = useState('');
 const [room, setRoom] = useState('');
 const [notes, setNotes] = useState('');
 const [repeatWeekly, setRepeatWeekly] = useState(false);
 const [repeatWeeks, setRepeatWeeks] = useState(4);
 const [saving, setSaving] = useState(false);
 const [progress, setProgress] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [fieldError, setFieldError] = useState<string | null>(null);

 // today for min-date
 const todayStr = useMemo(() => {
 const d = new Date();
 const pad = (n: number) => String(n).padStart(2, '0');
 return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
 }, []);

 useEffect(() => {
 if (!open) return;
 setError(null); setFieldError(null); setProgress(null);
 if (editing) {
 setClassGroupId(editing.classGroupId); setTitle(editing.title ?? '');
 setDate(isoToDate(editing.startAt)); setStartTime(isoToTime(editing.startAt)); setEndTime(isoToTime(editing.endAt));
 setMode(editing.mode); setProvider(editing.provider ?? 'GOOGLE_MEET');
 setMeetingUrl(editing.meetingUrl ?? ''); setRoom(editing.room ?? ''); setNotes(editing.notes ?? '');
 setRepeatWeekly(false);
 } else {
 setClassGroupId(classes[0]?.id ?? ''); setTitle(''); setDate(initialDate ?? '');
 setStartTime('09:00'); setEndTime('10:30'); setMode('ONLINE'); setProvider('GOOGLE_MEET');
 setMeetingUrl(''); setRoom(''); setNotes(''); setRepeatWeekly(false); setRepeatWeeks(4);
 }
 }, [open, editing, classes, initialDate]);

 // keep end after start — if start moves past end, bump end forward
 useEffect(() => {
 if (!startTime || !endTime) return;
 if (endTime <= startTime) {
 const [h, m] = startTime.split(':').map(Number);
 const total = h * 60 + m + 90;
 const nh = Math.floor((total % 1440) / 60);
 const nm = total % 60;
 const pad = (n: number) => String(n).padStart(2, '0');
 const bumped = `${pad(nh)}:${pad(nm)}`;
 // only auto-bump if end would be invalid; don't loop
 if (bumped !== endTime) setEndTime(bumped);
 }
 }, [startTime, endTime]);

 if (!open) return null;

 const durationLabel = (() => {
 if (!startTime || !endTime || endTime <= startTime) return null;
 const [sh, sm] = startTime.split(':').map(Number);
 const [eh, em] = endTime.split(':').map(Number);
 const mins = eh * 60 + em - (sh * 60 + sm);
 const h = Math.floor(mins / 60);
 const m = mins % 60;
 if (h === 0) return `${m} min`;
 if (m === 0) return `${h}h`;
 return `${h}h ${m}min`;
 })();

 async function handleSubmit(e: FormEvent) {
 e.preventDefault();
 if (!classGroupId) { setFieldError('Choose a class.'); return; }
 if (!date) { setFieldError('Pick a date for this session.'); return; }
 if (!startTime || !endTime) { setFieldError('Pick start and end times.'); return; }
 if (endTime <= startTime) { setFieldError('End time must be after start time on the same day.'); return; }
 if ((mode === 'ONLINE' || mode === 'HYBRID') && !meetingUrl.trim()) { setFieldError('Meeting link is required for online sessions.'); return; }
 setFieldError(null); setError(null); setSaving(true); setProgress(null);
 try {
 if (editing) {
 const payload: Record<string, unknown> = {
 classGroupId, title: title.trim() || undefined, startAt: combine(date, startTime), endAt: combine(date, endTime), mode, provider,
 meetingUrl: meetingUrl.trim() || undefined, room: room.trim() || undefined, notes: notes.trim() || undefined,
 };
 await updateSession(editing.id, payload);
 } else if (repeatWeekly) {
 const base = parseISO(date);
 for (let i = 0; i < repeatWeeks; i++) {
 const d = format(addWeeks(base, i), 'yyyy-MM-dd');
 setProgress(`Creating ${i + 1} of ${repeatWeeks}…`);
 const payload: Record<string, unknown> = {
 classGroupId, title: title.trim() || undefined, startAt: combine(d, startTime), endAt: combine(d, endTime), mode, provider,
 meetingUrl: meetingUrl.trim() || undefined, room: room.trim() || undefined, notes: notes.trim() || undefined,
 };
 await createSession(payload);
 }
 } else {
 const payload: Record<string, unknown> = {
 classGroupId, title: title.trim() || undefined, startAt: combine(date, startTime), endAt: combine(date, endTime), mode, provider,
 meetingUrl: meetingUrl.trim() || undefined, room: room.trim() || undefined, notes: notes.trim() || undefined,
 };
 await createSession(payload);
 }
 onSaved(); onClose();
 } catch (err) { setError(apiErrorMessage(err, 'Could not save session.')); } finally { setSaving(false); setProgress(null); }
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 <form onSubmit={handleSubmit} className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-box bg-base-100">
 <div className="shrink-0 border-b border-line px-5 py-4 pr-12">
 <h3 className="text-sm font-bold">{isEdit ? 'Edit session' : 'New live class'}</h3>
 <p className="mt-1 text-xs text-muted">One day, one class — students see it instantly in their schedule.</p>
 <button type="button" onClick={onClose} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3"><FiX aria-hidden /></button>
 </div>
 <div className="flex-1 overflow-y-auto px-5 py-5">
 <div className="space-y-4">
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Class *</span><select required value={classGroupId} onChange={(e) => setClassGroupId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200"><option value="">Select class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.code}</option>)}</select></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Session title</span><input value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="e.g. Conversation Practice — A2" className="input w-full rounded-field border-line bg-base-200" /></label>

 <div className="rounded-box border border-line bg-base-200/30 p-3">
 <p className="flex items-center gap-2 text-xs font-semibold"><FiClock aria-hidden className="text-brand" />When *</p>
 <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_1fr_1fr]">
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Date *</span><input required type="date" value={date} min={todayStr} onChange={(e) => setDate(e.currentTarget.value)} className="input w-full rounded-field border-line bg-base-100" /></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Starts *</span><input required type="time" value={startTime} onChange={(e) => setStartTime(e.currentTarget.value)} className="input w-full rounded-field border-line bg-base-100" /></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Ends *</span><input required type="time" value={endTime} min={startTime || undefined} onChange={(e) => setEndTime(e.currentTarget.value)} className="input w-full rounded-field border-line bg-base-100" /></label>
 </div>
 {durationLabel ? <p className="mt-2 text-center text-xs font-medium text-brand">Duration: {durationLabel} · {date || '—'} · {startTime} → {endTime}</p> : <p className="mt-2 text-center text-xs text-muted">Pick date and times — end must be after start.</p>}
 </div>

 <RepeatField enabled={repeatWeekly} onEnabled={setRepeatWeekly} count={repeatWeeks} onCount={setRepeatWeeks} date={date} startTime={startTime} endTime={endTime} disabled={Boolean(isEdit)} />

 <div><span className="mb-2 block text-xs font-medium">Mode *</span><div className="grid grid-cols-3 gap-2">{MODE_OPTIONS.map((o) => { const Icon = o.icon; const active = mode === o.value; return <button key={o.value} type="button" onClick={() => setMode(o.value)} aria-pressed={active} className={`rounded-box border p-3 text-left ${active ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:bg-base-200/50'}`}><Icon aria-hidden className={`text-sm ${active ? 'text-brand' : 'text-muted'}`} /><span className={`mt-1 block text-xs font-semibold ${active ? 'text-[#B30A00]' : ''}`}>{o.label}</span><span className="block text-[11px] text-muted">{o.hint}</span></button>; })}</div></div>
 {(mode === 'ONLINE' || mode === 'HYBRID') ? (
 <>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Provider</span><select value={provider} onChange={(e) => setProvider(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">{PROVIDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Meeting link *</span><input value={meetingUrl} onChange={(e) => setMeetingUrl(e.currentTarget.value)} placeholder="https://meet.google.com/..." className="input w-full rounded-field border-line bg-base-100" /></label>
 </>
 ) : null}
 {(mode === 'ONSITE' || mode === 'HYBRID') ? <label className="block"><span className="mb-1.5 block text-xs font-medium">Room</span><input value={room} onChange={(e) => setRoom(e.currentTarget.value)} placeholder="e.g. Raum 2" className="input w-full rounded-field border-line bg-base-100" /></label> : null}
 <label className="block"><span className="mb-1.5 block text-xs font-medium">Notes (visible to students)</span><textarea value={notes} onChange={(e) => setNotes(e.currentTarget.value)} rows={2} placeholder="What will you cover?" className="textarea w-full rounded-field border-line bg-base-100" /></label>
 {progress ? <p role="status" className="flex items-center gap-2 rounded-field bg-brand-soft px-3 py-2 text-xs font-medium text-[#B30A00]"><span className="loading loading-spinner loading-xs" />{progress}</p> : null}
 {fieldError ? <p role="alert" className="flex gap-2 rounded-field bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"><FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />{fieldError}</p> : null}
 {error ? <p role="alert" className="flex gap-2 rounded-field bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]"><FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />{error}</p> : null}
 </div>
 </div>
 <div className="flex shrink-0 justify-end gap-2 border-t border-line bg-base-200/30 px-5 py-4"><button type="button" onClick={onClose} className="btn btn-sm rounded-full border-line bg-base-100">Cancel</button><button type="submit" disabled={saving} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">{saving ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />}{isEdit ? 'Save changes' : repeatWeekly ? `Schedule ${repeatWeeks} sessions` : 'Schedule'}</button></div>
 </form>
 </div>
 );
}
