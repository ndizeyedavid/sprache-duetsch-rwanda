type SegmentedControlProps = {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  className?: string;
};

/** Pill switcher used for "Last Week / This Week" and "Insight / Selling". */
export function SegmentedControl({
  options,
  value,
  onChange,
  ariaLabel = 'View',
  className = '',
}: SegmentedControlProps) {
  return (
    <div role="group" aria-label={ariaLabel} className={`flex items-center gap-1 ${className}`}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selected ? 'bg-brand text-white' : 'bg-base-200 text-muted hover:text-ink'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
