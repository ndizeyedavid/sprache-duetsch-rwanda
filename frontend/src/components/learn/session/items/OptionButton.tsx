type Props = { label: string; index: number; selected: boolean; state: 'idle' | 'right' | 'wrong'; disabled: boolean; lang?: 'de' | 'en'; onClick: () => void };

/** A large answer choice with its keyboard number; turns green/red after checking. */
export function OptionButton({ label, index, selected, state, disabled, lang, onClick }: Props) {
  const tone = state === 'right' ? 'border-ok bg-ok-soft text-ok'
    : state === 'wrong' ? 'border-bad bg-bad-soft text-bad'
      : selected ? 'border-primary bg-brand-soft text-ink' : 'border-line bg-base-100 hover:border-primary';
  return <button type="button" disabled={disabled} onClick={onClick} aria-pressed={selected} lang={lang}
    className={`flex min-h-12 w-full items-center gap-3 rounded-box border-2 px-3 py-2 text-left text-base font-medium transition-colors disabled:cursor-default ${tone}`}>
    <span aria-hidden className={`flex size-6 shrink-0 items-center justify-center rounded-md border text-xs ${state === 'idle' ? 'border-line text-muted' : 'border-current'}`}>{index + 1}</span>
    <span className="min-w-0">{label}</span>
  </button>;
}
