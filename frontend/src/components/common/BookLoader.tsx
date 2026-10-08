type Props = { label?: string; size?: number; className?: string };

const PAGE_RIGHT = 'M57 9.5Q45 4.5 32 10V39Q45 34 57 38.5Z';

/** Lightweight inline SVG loader: an open school book turning its pages. */
export function BookLoader({ label = 'Loading…', size = 56, className = '' }: Props) {
  return (
    <div role="status" aria-live="polite" className={`loader-in flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg viewBox="0 0 64 48" width={size} height={size * 0.75} aria-hidden className="book-loader">
        <path d="M4 10Q18 3.5 32 10Q46 3.5 60 10V42.5Q46 36 32 42.5Q18 36 4 42.5Z" fill="var(--color-brand)" />
        <path d="M7 9.5Q19 4.5 32 10V39Q19 34 7 38.5Z" fill="var(--color-base-100)" />
        <path d={PAGE_RIGHT} fill="var(--color-base-100)" />
        <path d="M32 10V39" stroke="var(--color-base-300)" strokeWidth="0.8" />
        <path className="book-leaf" d={PAGE_RIGHT} />
        <path className="book-leaf book-leaf-late" d={PAGE_RIGHT} />
      </svg>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}
