import { useEffect, useState } from "react";
import { FiBell, FiMail, FiSmartphone } from "react-icons/fi";

const KEY = "sparch.notifPrefs";

type Prefs = {
 email: boolean;
 inApp: boolean;
 schedule: boolean;
 exam: boolean;
 payment: boolean;
};

const DEFAULTS: Prefs = {
 email: true,
 inApp: true,
 schedule: true,
 exam: true,
 payment: true,
};

function load(): Prefs {
 try {
 const raw = localStorage.getItem(KEY);
 if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Prefs>) };
 } catch {
 // ignore
 }
 return DEFAULTS;
}

export function NotificationsPane() {
 const [prefs, setPrefs] = useState<Prefs>(load);
 const [saved, setSaved] = useState(false);

 useEffect(() => {
 localStorage.setItem(KEY, JSON.stringify(prefs));
 setSaved(true);
 const t = setTimeout(() => setSaved(false), 1200);
 return () => clearTimeout(t);
 }, [prefs]);

 function toggle(k: keyof Prefs) {
 setPrefs((p) => ({ ...p, [k]: !p[k] }));
 }

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
 </div>

 <div className="space-y-2">
 <label className="flex cursor-pointer items-center justify-between gap-3 rounded-box border border-line bg-base-100 p-3">
 <span className="flex items-center gap-2">
 <FiMail aria-hidden className="text-muted" />
 <span className="text-sm font-medium">Email digests</span>
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
