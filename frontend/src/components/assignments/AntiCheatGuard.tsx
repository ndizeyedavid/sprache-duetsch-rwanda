import { FiAlertTriangle, FiMaximize2, FiShield, FiEyeOff } from "react-icons/fi";
import { useAntiCheat } from "../../hooks/useAntiCheat";
import type { ViolationType } from "../../hooks/useAntiCheat";
import { useSession } from "../../lib/session";

type Props = {
  enabled: boolean;
  persistKey?: string;
  onViolation?: (type: ViolationType) => void;
  onLock?: () => void;
  children: React.ReactNode;
};

export function AntiCheatGuard({ enabled, persistKey, onViolation, onLock, children }: Props) {
  const { user } = useSession();
  const { containerRef, violations, locked, remaining, isFullscreen, enterFullscreen } = useAntiCheat(enabled, 3, {
    persistKey,
    onViolation,
  });

  if (locked && onLock) {
    // Trigger once when locked
    setTimeout(() => onLock(), 0);
  }

  const watermark = user ? `${user.firstName} ${user.lastName} · ${user.email}` : "";

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-box border bg-base-100 ${enabled ? "border-warning/30 select-none" : "border-line"}`}
    >
      {enabled ? (
        <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 border-b border-warning/20 bg-warning/10 px-3 py-2 text-xs">
          <span className="flex items-center gap-2 font-semibold">
            <FiShield aria-hidden className="text-warning" />
            Protected assignment — fullscreen required
            <span className={`rounded-full px-2 py-0.5 text-[11px] ${remaining === 0 ? "bg-error text-white" : remaining === 1 ? "bg-coral-soft text-coral" : "bg-base-100 text-muted"}`}>
              {violations.length}/3 violations
            </span>
          </span>
          <span className="flex items-center gap-2">
            {!isFullscreen ? (
              <button type="button" onClick={() => void enterFullscreen()} className="btn btn-xs gap-1 rounded-full border-0 bg-warning text-white">
                <FiMaximize2 aria-hidden />
                Enter fullscreen
              </button>
            ) : (
              <span className="rounded-full bg-success/15 px-2 py-1 text-[11px] font-medium text-success">Fullscreen active</span>
            )}
            <span className="hidden items-center gap-1 text-[11px] text-muted sm:inline-flex">
              <FiEyeOff aria-hidden />
              Copy / paste / tab switch blocked
            </span>
          </span>
        </div>
      ) : null}

      {enabled && watermark ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(-25deg, transparent 0 180px, currentColor 180px 181px)`,
          }}
        >
          <div className="flex h-full w-full flex-wrap content-center justify-center gap-8 p-8 text-[11px] font-bold tracking-widest text-ink">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="rotate-[-18deg] whitespace-nowrap">
                {watermark}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {enabled && !isFullscreen ? (
        <>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="w-full max-w-md rounded-box border border-warning bg-base-100 p-6 text-center shadow-xl">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-warning/10 text-warning">
                <FiMaximize2 aria-hidden size={22} />
              </span>
              <h3 className="mt-3 text-base font-bold">Fullscreen required</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-muted">
                This assignment must be completed in fullscreen. Tap the button below or press{" "}
                <kbd className="rounded bg-base-200 px-1.5 py-0.5 text-xs font-mono">F11</kbd> to continue. Exiting counts as a
                violation (3 = auto-submit & flagged).
              </p>
              <button
                type="button"
                onClick={() => void enterFullscreen()}
                className="btn mt-4 gap-2 rounded-full border-0 bg-warning px-6 text-white hover:bg-warning/90"
                autoFocus
              >
                <FiMaximize2 aria-hidden />
                Go to fullscreen
              </button>
              <p className="mt-2 text-[11px] text-muted">Press Esc to exit is blocked — it will count as a violation.</p>
            </div>
          </div>
          <div className="relative z-20 m-3 rounded-box border border-warning bg-warning/5 p-3 text-center text-xs font-medium text-warning">
            Fullscreen is required to view questions — click Go to fullscreen above
          </div>
        </>
      ) : null}

      {enabled && violations.length > 0 ? (
        <div className="relative z-20 mx-3 mt-3 space-y-1">
          {violations.slice(-2).map((v, idx) => (
            <p key={`${v.at}-${idx}`} role="alert" className="flex items-center gap-2 rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-coral">
              <FiAlertTriangle aria-hidden />
              {v.message}
              <span className="ml-auto text-[11px]">{remaining} left</span>
            </p>
          ))}
          {locked ? (
            <div role="alert" className="rounded-box bg-error px-3 py-3 text-center text-sm font-bold text-white">
              Assignment locked — 3 violations. Your work will be flagged for review. Contact your teacher.
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={`relative z-10 ${enabled && !isFullscreen ? "pointer-events-none opacity-40 blur-[1.5px]" : ""} ${enabled ? "select-none" : ""}`}>{children}</div>
    </div>
  );
}
