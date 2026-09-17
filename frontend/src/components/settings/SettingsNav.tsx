import { FiBell, FiDroplet, FiLock, FiShield, FiUser } from 'react-icons/fi';

export const SETTINGS_TABS = [
 { id: 'profile', label: 'Profile', icon: FiUser, desc: 'Name, email, avatar' },
 { id: 'security', label: 'Security', icon: FiLock, desc: 'Password & sessions' },
 { id: 'appearance', label: 'Appearance', icon: FiDroplet, desc: 'Theme & display' },
 { id: 'notifications', label: 'Notifications', icon: FiBell, desc: 'Alerts & emails' },
 { id: 'about', label: 'About', icon: FiShield, desc: 'App & privacy' },
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number]['id'];

type Props = { active: SettingsTab; onChange: (id: SettingsTab) => void };

export function SettingsNav({ active, onChange }: Props) {
 return (
 <nav aria-label="Settings" className="space-y-1">
 {SETTINGS_TABS.map((t) => {
 const Icon = t.icon;
 const isActive = active === t.id;
 return (
 <button
 key={t.id}
 type="button"
 onClick={() => onChange(t.id)}
 aria-current={isActive ? 'page' : undefined}
 className={`flex w-full items-center gap-3 rounded-box border px-3 py-3 text-left transition ${isActive ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:border-brand/20'}`}
 >
 <span className={`flex size-8 items-center justify-center rounded-full ${isActive ? 'bg-brand text-white' : 'bg-base-200 text-muted'}`}>
 <Icon aria-hidden className="text-sm" />
 </span>
 <span className="min-w-0 grow">
 <span className={`block text-sm font-semibold leading-tight ${isActive ? 'text-[#B30A00]' : ''}`}>{t.label}</span>
 <span className="block text-[11px] text-muted">{t.desc}</span>
 </span>
 </button>
 );
 })}
 </nav>
 );
}
