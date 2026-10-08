import { FiDroplet, FiLock, FiUser } from 'react-icons/fi';

export const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: FiUser, desc: 'Name, phone and photo' },
  { id: 'security', label: 'Security', icon: FiLock, desc: 'Password' },
  { id: 'appearance', label: 'Appearance', icon: FiDroplet, desc: 'Theme' },
] as const;

export type SettingsTab = (typeof SETTINGS_TABS)[number]['id'];
export const isSettingsTab = (value: string | null): value is SettingsTab => SETTINGS_TABS.some(tab => tab.id === value);
