import { needsPreferenceSave } from './notification-save-policy';
import { useEffect,useRef,useState } from "react";
import { FiBell,FiMail,FiSmartphone } from "react-icons/fi";
import { apiErrorMessage } from '../../lib/api';
import type { NotificationPreferences } from '../../lib/notifications';
import { getNotificationPreferences,saveNotificationPreferences } from '../../lib/notifications';

export function NotificationsPane() {
 const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
 const [saved, setSaved] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const savedValue = useRef('');
 const queuedValue = useRef('');
 const saveQueue = useRef<Promise<void>>(Promise.resolve());
 const [loadRetry, setLoadRetry] = useState(0);
 const [saveRetry, setSaveRetry] = useState(0);

 useEffect(() => {
 let active = true;
 void getNotificationPreferences().then(value => { if (active) { setPrefs(value); savedValue.current = JSON.stringify(value); queuedValue.current = savedValue.current; } })
 .catch(cause => { if (active) setError(apiErrorMessage(cause, 'Could not load notification preferences.')); });
 return () => { active = false; };
 }, [loadRetry]);

 useEffect(() => {
 if (!prefs || !needsPreferenceSave(JSON.stringify(prefs), savedValue.current, queuedValue.current)) return;
 const value = { ...prefs };
 let active = true;
 const timer = setTimeout(() => {
 queuedValue.current = JSON.stringify(value);
 saveQueue.current = saveQueue.current.catch(() => {}).then(async () => {
 const result = await saveNotificationPreferences(value);
 savedValue.current = JSON.stringify(result); if (!active) return; setError(null); setSaved(true);
 setTimeout(() => setSaved(false), 1200);
 }).catch(cause => { if (active) setError(apiErrorMessage(cause, 'Could not save preferences. Check your connection and retry.')); });
 }, 350);
 return () => { active = false; clearTimeout(timer); };
 }, [prefs, saveRetry]);

 function toggle(k: keyof NotificationPreferences) {
 setPrefs((p) => p ? { ...p, [k]: !p[k] } : p);
 }

 if (!prefs && !error) return <p className="text-sm text-base-content/60" role="status">Loading notification preferences…</p>;
 if (!prefs) return <div role="alert" className="alert alert-error alert-soft text-sm">{error}<button className="btn btn-sm" onClick={() => { setError(null); setLoadRetry(value => value + 1); }}>Retry</button></div>;

 return (
 <div className="space-y-4">
 <div className="rounded-box border border-line bg-base-200/30 p-3">
 <p className="flex items-center gap-2 text-xs font-semibold">
 <FiBell aria-hidden className="text-brand" />
 Notifications
 </p>
 {saved ? (
 <span className="mt-2 inline-flex rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-[#B30A00]">
 Saved
 </span>
 ) : null}
 {error ? <p role="alert" className="mt-2 text-xs text-error">{error} <button className="link link-error" onClick={() => { setError(null); setSaveRetry(value => value + 1); }}>Retry</button></p> : null}
 </div>

 <div className="space-y-2">
 <label className="flex cursor-pointer items-center justify-between gap-3 rounded-box border border-line bg-base-100 p-3">
 <span className="flex items-center gap-2">
 <FiMail aria-hidden className="text-muted" />
 <span className="text-sm font-medium">Email notifications</span>
 </span>
 <input
 type="checkbox"
 className="toggle toggle-sm border-line bg-base-200 checked:bg-brand checked:border-brand"
 checked={prefs.email}
 onChange={() => toggle("email")}
 />
 </label>
 <label className="flex cursor-pointer items-center justify-between gap-3 rounded-box border border-line bg-base-100 p-3">
 <span className="flex items-center gap-2">
 <FiBell aria-hidden className="text-muted" />
 <span className="text-sm font-medium">In-app feed</span>
 </span>
 <input
 type="checkbox"
 className="toggle toggle-sm border-line bg-base-200 checked:bg-brand checked:border-brand"
 checked={prefs.inApp}
 onChange={() => toggle("inApp")}
 />
 </label>
 <label className="flex cursor-pointer items-center justify-between gap-3 rounded-box border border-line bg-base-100 p-3">
 <span className="flex items-center gap-2">
 <FiSmartphone aria-hidden className="text-muted" />
 <span className="text-sm font-medium">Schedule updates</span>
 </span>
 <input
 type="checkbox"
 className="toggle toggle-sm border-line bg-base-200 checked:bg-brand checked:border-brand"
 checked={prefs.schedule}
 onChange={() => toggle("schedule")}
 />
 </label>
 <label className="flex cursor-pointer items-center justify-between gap-3 rounded-box border border-line bg-base-100 p-3">
 <span className="flex items-center gap-2">
 <FiBell aria-hidden className="text-muted" />
 <span className="text-sm font-medium">Exams & grading</span>
 </span>
 <input
 type="checkbox"
 className="toggle toggle-sm border-line bg-base-200 checked:bg-brand checked:border-brand"
 checked={prefs.exam}
 onChange={() => toggle("exam")}
 />
 </label>
 <label className="flex cursor-pointer items-center justify-between gap-3 rounded-box border border-line bg-base-100 p-3">
 <span className="flex items-center gap-2">
 <FiBell aria-hidden className="text-muted" />
 <span className="text-sm font-medium">Payments</span>
 </span>
 <input
 type="checkbox"
 className="toggle toggle-sm border-line bg-base-200 checked:bg-brand checked:border-brand"
 checked={prefs.payment}
 onChange={() => toggle("payment")}
 />
 </label>
 </div>
 </div>
 );
}
