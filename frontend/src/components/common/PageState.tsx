export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div
      className="flex min-h-40 items-center justify-center gap-3 py-10"
      role="status"
      aria-live="polite"
    >
      <span className="loading loading-spinner loading-md text-brand" />
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}

export function ErrorBlock({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="alert alert-error my-4" role="alert">
      <span className="text-sm">{message}</span>
      {onRetry ? (
        <button type="button" className="btn btn-sm" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyBlock({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-box border border-dashed border-line bg-base-100 px-6 py-10 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
