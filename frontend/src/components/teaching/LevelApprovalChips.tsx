import type { LevelItem } from '../../lib/services';

type LevelApprovalChipsProps = {
  levels: LevelItem[];
  selected: string[];
  onToggle: (levelId: string) => void;
  disabled?: boolean;
};

/**
 * Level approval as a multi-select chip group. Each chip keeps a real checkbox
 * so the "several levels at once" intent stays obvious; retired levels stay
 * selectable because an existing approval survives a level being retired.
 */
export function LevelApprovalChips({
  levels,
  selected,
  onToggle,
  disabled = false,
}: LevelApprovalChipsProps) {
  // A disabled chip must not invite the hover state it will never act on.
  const affordance = disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:border-brand hover:text-brand';

  return (
    <fieldset disabled={disabled}>
      <legend className="sr-only">Approved teaching levels</legend>
      <div className="flex flex-wrap gap-2">
        {levels.map((level) => {
          const checked = selected.includes(level.id);
          return (
            <label
              key={level.id}
              className={`flex items-center gap-2 rounded-full border py-2 pr-3 pl-2.5 text-xs font-medium transition-colors ${affordance} ${
                checked
                  ? 'border-brand bg-brand text-primary-content text-brand-soft-ink'
                  : 'border-line bg-base-100 text-muted'
              }`}
            >
              <input
                type="checkbox"
                className="checkbox checkbox-xs"
                checked={checked}
                onChange={() => onToggle(level.id)}
              />
              {level.code}
              <span className="sr-only">
                {' '}
                {level.title}
                {level.isActive ? '' : ' (retired)'}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}