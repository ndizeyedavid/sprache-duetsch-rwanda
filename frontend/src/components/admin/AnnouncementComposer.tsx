import type { FormEvent } from 'react';
import { useState } from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import {
createAnnouncement,
humanize,
listCampusesFull,
listClasses,
listIntakesFull,
listLevels,
} from '../../lib/services';

const AUDIENCES = ['STUDENTS', 'STAFF', 'ALL'] as const;

export function AnnouncementComposer({ onSent }: { onSent: () => void }) {
 const levels = useApi('levels-catalog', listLevels);
 const intakes = useApi('intakes-full', listIntakesFull);
 const campuses = useApi('campuses-full', listCampusesFull);
 const classes = useApi('admin-classes', listClasses);

 const [title, setTitle] = useState('');
 const [body, setBody] = useState('');
 const [audience, setAudience] = useState<string>('STUDENTS');
 const [levelId, setLevelId] = useState('');
 const [intakeId, setIntakeId] = useState('');
 const [campusId, setCampusId] = useState('');
 const [classGroupId, setClassGroupId] = useState('');
 const [formError, setFormError] = useState<string | null>(null);
 const [saving, setSaving] = useState(false);

 async function handleSend(event: FormEvent) {
 event.preventDefault();
 setFormError(null);
 setSaving(true);
 try {
 const target = {
 ...(levelId ? { levelId } : {}),
 ...(intakeId ? { intakeId } : {}),
 ...(campusId ? { campusId } : {}),
 ...(classGroupId ? { classGroupId } : {}),
 };
 await createAnnouncement({
 title: title.trim(),
 body: body.trim(),
 audience: audience as 'STUDENTS' | 'STAFF' | 'ALL',
 target: Object.keys(target).length > 0 ? target : undefined,
 });
 setTitle('');
 setBody('');
 onSent();
 } catch (err) {
 setFormError(apiErrorMessage(err, 'Could not send the announcement.'));
 } finally {
 setSaving(false);
 }
 }

 return (<div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
 <form onSubmit={handleSend} className="space-y-3">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Headline</span>
 <input required value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder="e.g. Holiday Schedule Update" className="input w-full rounded-field border-line bg-base-200" />
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Message</span>
 <textarea required value={body} onChange={(e) => setBody(e.currentTarget.value)} placeholder="Write your announcement message..." rows={4} className="textarea w-full rounded-field border-line bg-base-200" />
 </label>
 <div className="grid gap-3 sm:grid-cols-2">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Audience</span>
 <select value={audience} onChange={(e) => setAudience(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 {AUDIENCES.map((option) => (
 <option key={option} value={option}>
 {humanize(option)}
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Level (optional)</span>
 <select value={levelId} onChange={(e) => setLevelId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Any level</option>
 {(levels.data ?? []).map((level) => (
 <option key={level.id} value={level.id}>
 {level.code}
 </option>
 ))}
 </select>
 </label>
 </div>
 <div className="grid gap-3 sm:grid-cols-3">
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Intake</span>
 <select value={intakeId} onChange={(e) => setIntakeId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Any intake</option>
 {(intakes.data ?? []).map((intake) => (
 <option key={intake.id} value={intake.id}>
 {intake.name}
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Campus</span>
 <select value={campusId} onChange={(e) => setCampusId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Any campus</option>
 {(campuses.data ?? []).map((campus) => (
 <option key={campus.id} value={campus.id}>
 {campus.name}
 </option>
 ))}
 </select>
 </label>
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Class</span>
 <select value={classGroupId} onChange={(e) => setClassGroupId(e.currentTarget.value)} className="select w-full rounded-field border-line bg-base-200">
 <option value="">Any class</option>
 {(classes.data ?? []).map((group) => (
 <option key={group.id} value={group.id}>
 {group.name}
 </option>
 ))}
 </select>
 </label>
 </div>
 {formError ? (
 <p role="alert" className="text-xs font-medium text-error">
 {formError}
 </p>
 ) : null}
 <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60">
 {saving ? <span className="loading loading-spinner loading-sm" /> : 'Send announcement'}
 </button>
 </form>
 <div className="mb-5 rounded-box border border-base-300 bg-base-200 p-4">
 <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted"><FiMessageCircle aria-hidden />Message preview</p>
 <h3 className="mt-3 break-words text-base font-semibold">{title.trim() || 'Your headline appears here'}</h3>
 <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-6 text-muted">{body.trim() || 'Write a short, helpful update for your school community.'}</p>
 <p className="mt-4 border-t border-base-300 pt-3 text-[11px] text-muted">Audience: {humanize(audience)}{levelId || intakeId || campusId || classGroupId ? ' · Cohort filters applied' : ' · No cohort filters'}</p>
 </div>

 </div>);
}
