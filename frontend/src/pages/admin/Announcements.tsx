import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import {
  createAnnouncement,
  humanize,
  isoDate,
  listCampusesFull,
  listClasses,
  listIntakesFull,
  listLevels,
  listNotifications,
} from '../../lib/services';

const AUDIENCES = ['STUDENTS', 'STAFF', 'ALL'] as const;

export function AdminAnnouncements() {
  const levels = useApi('levels-catalog', listLevels);
  const intakes = useApi('intakes-full', listIntakesFull);
  const campuses = useApi('campuses-full', listCampusesFull);
  const classes = useApi('admin-classes', listClasses);
  const recent = useApi('announcements-recent', listNotifications);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<string>('STUDENTS');
  const [levelId, setLevelId] = useState('');
  const [intakeId, setIntakeId] = useState('');
  const [campusId, setCampusId] = useState('');
  const [classGroupId, setClassGroupId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSent(false);
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
      setSent(true);
      recent.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not send the announcement.'));
    } finally {
      setSaving(false);
    }
  }

  const items = (recent.data ?? []).filter((item) => item.type === 'ANNOUNCEMENT');

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel className="lg:col-span-2">
        <SectionHeader title="Send an announcement" />
        <form onSubmit={handleSend} className="space-y-3">
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Headline" className="input w-full rounded-field border-line bg-base-200" />
          <textarea required value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message" rows={4} className="textarea w-full rounded-field border-line bg-base-200" />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Audience</span>
              <select value={audience} onChange={(e) => setAudience(e.target.value)} className="select w-full rounded-field border-line bg-base-200">
                {AUDIENCES.map((option) => (
                  <option key={option} value={option}>
                    {humanize(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium">Level (optional)</span>
              <select value={levelId} onChange={(e) => setLevelId(e.target.value)} className="select w-full rounded-field border-line bg-base-200">
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
            <select value={intakeId} onChange={(e) => setIntakeId(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Intake">
              <option value="">Any intake</option>
              {(intakes.data ?? []).map((intake) => (
                <option key={intake.id} value={intake.id}>
                  {intake.name}
                </option>
              ))}
            </select>
            <select value={campusId} onChange={(e) => setCampusId(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Campus">
              <option value="">Any campus</option>
              {(campuses.data ?? []).map((campus) => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
            <select value={classGroupId} onChange={(e) => setClassGroupId(e.target.value)} className="select w-full rounded-field border-line bg-base-200" aria-label="Class group">
              <option value="">Any class</option>
              {(classes.data ?? []).map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          {formError ? (
            <p role="alert" className="text-xs font-medium text-error">
              {formError}
            </p>
          ) : null}
          {sent ? <p className="text-xs font-medium text-brand">Announcement sent.</p> : null}
          <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
            {saving ? <span className="loading loading-spinner loading-sm" /> : 'Send announcement'}
          </button>
        </form>
      </Panel>

      <Panel className="lg:col-span-1">
        <SectionHeader title="Recent announcements" />
        {recent.loading ? (
          <LoadingBlock label="Loading…" />
        ) : recent.error ? (
          <ErrorBlock message={recent.error} onRetry={recent.refetch} />
        ) : items.length === 0 ? (
          <EmptyBlock title="Nothing sent yet" />
        ) : (
          <ul className="space-y-2">
            {items.slice(0, 12).map((item) => (
              <li key={item.id} className="rounded-field bg-base-200 px-3 py-2 text-xs">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-0.5 line-clamp-2 text-muted">{item.body}</p>
                <p className="mt-1 text-[11px] text-muted">{isoDate(item.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
