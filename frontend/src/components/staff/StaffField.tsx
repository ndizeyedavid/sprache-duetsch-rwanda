import type { ReactNode } from 'react';

type Props = {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null;
  children: ReactNode;
};

/** Label + control + hint/error, with the hint inside the label so it is announced. */
export function StaffField({ id, label, hint, error, children }: Props) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-[11px] font-semibold tracking-wide text-ink uppercase">
        {label}
      </span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[11px] font-medium text-[#D8482F]">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[11px] leading-snug text-muted">{hint}</span>
      ) : null}
    </label>
  );
}