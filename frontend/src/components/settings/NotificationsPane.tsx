import type { FormEvent } from 'react';
import { useState } from 'react';
import { FiAlertCircle,FiBell,FiCheck } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import type { NotificationPreferences } from '../../lib/notifications';
import { getNotificationPreferences,saveNotificationPreferences } from '../../lib/notifications';
import { useSession } from '../../lib/session';
import { ErrorBlock,LoadingBlock } from '../common/PageState';
import { CHANNELS,topicsFor } from './notification-topics';
import { PreferenceToggle } from './PreferenceToggle';

/** Settings → Notifications: channels × topics, saved to `PUT /notifications/preferences`. */
export function NotificationsPane() {
  const { user } = useSession();
  const saved = useApi('notification-preferences', getNotificationPreferences);
  const [draft, setDraft] = useState<NotificationPreferences | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  if (saved.loading) return <LoadingBlock label="Loading your notification settings…" />;
  if (saved.error || !saved.data) return <ErrorBlock message={saved.error ?? 'Could not load notification settings.'} onRetry={saved.refetch} />;

  const base = saved.data;
  const value = draft ?? base;
  const dirty = draft !== null && (Object.keys(draft) as (keyof NotificationPreferences)[]).some(key => draft[key] !== base[key]);
  const silenced = !value.inApp && !value.email;

  function toggle(key: keyof NotificationPreferences, next: boolean) {
    setOk(false);
    setDraft({ ...value, [key]: next });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(null); setOk(false);
    try {
      const result = await saveNotificationPreferences(value);
      setDraft(result);
      saved.refetch();
      setOk(true);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save your notification settings.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <div className="rounded-box border border-line bg-base-200 p-3">
        <p className="flex items-center gap-2 text-xs font-semibold"><FiBell aria-hidden className="text-brand" />Notifications</p>
        <p className="mt-1 text-xs leading-snug text-muted">Choose how we reach you and what about. Announcements and direct messages always arrive in the app while it is on.</p>
      </div>

      <fieldset className="fieldset">
        <legend className="fieldset-legend text-sm">How to reach you</legend>
        {CHANNELS.map(item => <PreferenceToggle key={item.key} label={item.label} hint={item.hint} checked={value[item.key]} onChange={next => toggle(item.key, next)} />)}
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend text-sm">What to hear about</legend>
        {topicsFor(user?.role ?? 'STUDENT').map(item => <PreferenceToggle key={item.key} label={item.label} hint={item.hint} checked={value[item.key]} onChange={next => toggle(item.key, next)} />)}
      </fieldset>

      {silenced ? <p role="status" className="alert alert-warning alert-soft text-xs">With both channels off you will not be told about class changes or deadlines.</p> : null}
      {error ? <p role="alert" className="flex gap-2 rounded-box bg-coral px-3 py-2 text-xs font-medium text-error-content"><FiAlertCircle aria-hidden className="mt-0.5 shrink-0" />{error}</p> : null}
      {ok ? <p role="status" className="flex gap-2 rounded-box bg-base-200 px-3 py-2 text-xs font-medium"><FiCheck aria-hidden className="text-brand" />Notification settings saved.</p> : null}

      <div className="flex justify-end">
        <button type="submit" disabled={saving || !dirty} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60">
          {saving ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />}Save
        </button>
      </div>
    </form>
  );
}
