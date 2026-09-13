type TabNavProps = {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
  className?: string;
};

export function TabNav({ tabs, active, onChange, className = '' }: TabNavProps) {
  return (
    <div
      role="tablist"
      className={`flex items-center gap-6 overflow-x-auto scrollbar-none border-b border-line ${className}`}
    >
      {tabs.map((tab) => {
        const selected = tab === active;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab)}
            className={`-mb-px shrink-0 border-b-2 pb-3 text-sm font-medium transition-colors ${
              selected
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
