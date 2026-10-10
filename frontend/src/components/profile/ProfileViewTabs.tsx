import type { ProfileView } from './constants';
import { PROFILE_VIEWS } from './constants';

type Props = {
  view: ProfileView;
  onChange: (view: ProfileView) => void;
  counts: Partial<Record<ProfileView, number>>;
};

export function ProfileViewTabs({ view, onChange, counts }: Props) {
  return (
    <div role="tablist" aria-label="Profile sections" className="flex flex-wrap items-center gap-2">
      {PROFILE_VIEWS.map((item) => {
        const active = item.key === view;
        const count = counts[item.key];
        return (
          <button
            key={item.key}
            id={`profile-tab-${item.key}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`profile-panel-${item.key}`}
            onClick={() => onChange(item.key)}
            className={`btn btn-sm gap-2 rounded-full ${
              active ? 'border-0 bg-brand text-white hover:bg-brand' : 'btn-ghost border border-line bg-base-100'
            }`}
          >
            {item.label}
            {count === undefined ? null : (
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${active ? 'bg-white text-brand' : 'bg-base-200 text-muted'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
