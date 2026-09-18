import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { Panel } from "../../components/ui/Panel";
import { SettingsNav } from "../../components/settings/SettingsNav";
import type { SettingsTab } from "../../components/settings/SettingsNav";
import { ProfilePane } from "../../components/settings/ProfilePane";
import { SecurityPane } from "../../components/settings/SecurityPane";
import { AppearancePane } from "../../components/settings/AppearancePane";
import { NotificationsPane } from "../../components/settings/NotificationsPane";

export function Settings() {
 const [searchParams, setSearchParams] = useSearchParams();
 const tabParam = (searchParams.get("tab") as SettingsTab) || "profile";
 const [tab, setTab] = useState<SettingsTab>(tabParam);

 function switchTab(next: SettingsTab) {
 setTab(next);
 const p = new URLSearchParams(searchParams);
 p.set("tab", next);
 setSearchParams(p, { replace: true });
 }

  return (
  <div className="space-y-4">
 <Panel>
 <h1 className="flex items-center gap-2 text-base font-bold">
 <FiSettings aria-hidden className="text-brand" />
 Profile & Settings
 </h1>
 <p className="mt-1 text-xs leading-snug text-muted">
 Profile, password, appearance and notifications. Changes save on this
 device and next login.
 </p>
 </Panel>

 <div className="grid gap-4 lg:grid-cols-12">
 <div className="lg:col-span-4">
 <Panel>
 <SettingsNav active={tab} onChange={switchTab} />
 </Panel>
 <Panel className="mt-4 border-l-4 border-l-info bg-[#eff6ff]">
 <h4 className="text-xs font-bold">Tip</h4>
 <p className="mt-1 text-xs leading-snug text-muted">
 Your avatar appears on activity posts and the top bar. Themes
 affect the whole app via daisyUI.
 </p>
 </Panel>
 </div>

 <div className="lg:col-span-8">
 <Panel>
 {tab === "profile" ? <ProfilePane /> : null}
 {tab === "security" ? <SecurityPane /> : null}
 {tab === "appearance" ? <AppearancePane /> : null}
 {tab === "notifications" ? <NotificationsPane /> : null}
 {tab === "about" ? (
 <div className="space-y-3 text-sm">
 <h3 className="font-bold">About Sprache RW</h3>
 <p className="text-xs leading-relaxed text-muted">
 Deutsch Sprache RW e-learning · A1–B2 · Built with Express +
 Prisma + React 19 + daisyUI 5. Avatars, themes and
 notifications are Canvas-inspired.
 </p>
 <ul className="list-disc pl-5 text-xs text-muted">
 <li>
 Profile edits are saved via PATCH /auth/me and audited.
 </li>
 <li>
 Themes use daisyUI data-theme — pick one and it persists in
 localStorage.
 </li>
 <li>
 Notifications beyond IN_APP are log-driver until provider
 keys exist.
 </li>
 </ul>
 </div>
 ) : null}
 </Panel>
 </div>
 </div>
 </div>
 );
}
