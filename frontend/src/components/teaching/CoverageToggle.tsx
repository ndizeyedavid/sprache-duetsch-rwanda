import { FiAlertTriangle } from 'react-icons/fi';
import { CORAL_INK,CORAL_SOFT } from './constants';

type CoverageToggleProps = {
  label: string;
  value: number;
  note: string;
  /** Solid coral surface — the "needs action" state is never carried by colour alone. */
  active: boolean;
  onToggle: () => void;
};

/**
 * One coverage number that is also its own filter. Pressing it narrows the class
 * roster to exactly the rows the number describes.
 *
 * Every state supplies exactly one background and one ink, so no two utilities
 * ever compete for the same CSS property.
 */
export function CoverageToggle({
  label,
  value,
  note,
  active,
  onToggle,
}: CoverageToggleProps) {
  const needsAction = value > 0;
  const surface = active ? CORAL_SOFT : 'bg-base-100';
  const heading = active ? CORAL_INK : 'text-muted';
  const figure = active ? CORAL_INK : needsAction ? 'text-coral' : 'text-ink';
  const caption = active ? CORAL_INK : 'text-muted';
  const idle = active ? '' : 'hover:bg-base-200';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`flex flex-col px-4 py-4 text-left transition-colors ${surface} ${idle}`}
    >
      <span className={`text-[11px] font-semibold uppercase tracking-wide ${heading}`}>
        {label}
      </span>
      <span className="mt-1 flex items-baseline gap-1.5">
        <span className={`text-2xl font-semibold tabular-nums ${figure}`}>{value}</span>
        {needsAction && !active ? (
          <FiAlertTriangle aria-hidden className="size-3.5 text-coral" />
        ) : null}
      </span>
      <span className={`mt-0.5 text-[11px] leading-4 ${caption}`}>{note}</span>
    </button>
  );
}