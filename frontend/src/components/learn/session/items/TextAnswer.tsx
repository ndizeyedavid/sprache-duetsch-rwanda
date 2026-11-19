import { useRef } from 'react';
import { UmlautKeys } from '../../../activity-player/UmlautKeys';

type Props = { value: string; onChange: (value: string) => void; onEnter: () => void; disabled: boolean; lang: 'de' | 'en'; placeholder: string; label: string };

/** Typed answer with ä ö ü ß keys for German; Enter checks. */
export function TextAnswer({ value, onChange, onEnter, disabled, lang, placeholder, label }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  function insert(letter: string) {
    const input = ref.current;
    const start = input?.selectionStart ?? value.length, end = input?.selectionEnd ?? value.length;
    onChange(value.slice(0, start) + letter + value.slice(end));
    requestAnimationFrame(() => { input?.focus(); input?.setSelectionRange(start + 1, start + 1); });
  }
  return <div className="space-y-2">
    <input ref={ref} type="text" value={value} disabled={disabled} lang={lang} autoComplete="off" autoCapitalize="off" spellCheck={false}
      aria-label={label} placeholder={placeholder} onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); onEnter(); } }}
      className="input input-lg w-full rounded-box border-2 border-line text-base focus:border-primary" />
    {lang === 'de' ? <UmlautKeys onInsert={insert} disabled={disabled} /> : null}
  </div>;
}
