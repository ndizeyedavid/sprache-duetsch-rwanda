import type { ReactNode } from 'react';

const toLocal = (v: string | null) => v ? new Date(new Date(v).getTime() - new Date(v).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '';

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium">{label}</span>{children}{hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}</label>;
}

export function DateTimeField({ label, value, onChange, disabled }: { label: string; value: string | null; onChange: (v: string | null) => void; disabled?: boolean }) {
  return <Field label={label}><input type="datetime-local" className="input input-sm w-full" disabled={disabled} value={toLocal(value)}
    onChange={e => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)} /></Field>;
}

export function NumberField({ label, value, onChange, min, max, step = 1, hint, disabled }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; hint?: string; disabled?: boolean }) {
  return <Field label={label} hint={hint}><input type="number" className="input input-sm w-full" min={min} max={max} step={step} disabled={disabled} value={value}
    onChange={e => onChange(Number(e.target.value))} /></Field>;
}

export function Toggle({ label, hint, checked, onChange, disabled }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-field border border-base-300 p-3">
      <input type="checkbox" className="toggle toggle-sm toggle-primary mt-0.5" checked={checked} disabled={disabled} onChange={e => onChange(e.target.checked)} />
      <span><span className="block text-sm font-medium">{label}</span>{hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}</span>
    </label>
  );
}

/** Small segmented control used for modes and kinds. */
export function Segmented<T extends string>({ value, options, onChange, disabled }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full bg-base-200 p-1" role="radiogroup">
      {options.map(o => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} disabled={disabled} onClick={() => onChange(o.value)}
          className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${value === o.value ? 'bg-base-100 font-semibold text-brand ' : 'text-muted hover:text-base-content'}`}>{o.label}</button>
      ))}
    </div>
  );
}
