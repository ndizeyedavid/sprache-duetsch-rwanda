import type { ReactNode } from 'react';

type FormFieldProps = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
};

/** Label + control + hint/error, with the hint living inside the label so it is announced. */
export function FormField({ id, label, hint, error, children }: FormFieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-ink uppercase">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[11px] font-medium text-error">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[11px] text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

export const FIELD_CLASS = 'select w-full rounded-field border-line bg-base-200 text-sm';