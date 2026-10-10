import type { SettingsTab } from './settings-tabs';
import { SETTINGS_TABS } from './settings-tabs';

type Props = { active: SettingsTab; onChange: (id: SettingsTab) => void };

export function SettingsNav({ active, onChange }: Props) {
  return (
    <nav aria-label="Settings" className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
      {SETTINGS_TABS.map(({ id, label, icon: Icon, desc }) => {
        const isActive = active === id;
        return (
          <button key={id} type="button" onClick={() => onChange(id)} aria-current={isActive ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-field px-3 py-2.5 text-left transition-colors lg:w-full ${isActive ? 'bg-brand/10 text-brand' : 'text-base-content/75 hover:bg-base-200'}`}>
            <Icon aria-hidden className="shrink-0 text-base" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-tight">{label}</span>
              <span className={`hidden text-xs lg:block ${isActive ? 'text-brand/70' : 'text-muted'}`}>{desc}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}
