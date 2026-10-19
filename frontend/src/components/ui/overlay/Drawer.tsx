import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { useId,useRef } from 'react';
import { createPortal } from 'react-dom';
import { Backdrop } from './Backdrop';
import { OverlayHeader } from './OverlayHeader';
import { useOverlay } from './useOverlay';

type Props = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconType;
  meta?: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
  children: ReactNode;
};

/** Full-height panel sliding in from the right (full screen on phones), rendered at <body>. */
export function Drawer({ open, onClose, title, subtitle, icon, meta, footer, busy = false, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { mounted, closing } = useOverlay(open, onClose, busy, panel);
  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      <Backdrop closing={closing} busy={busy} onClose={onClose} />
      <aside ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        className={`overlay-panel relative flex h-dvh w-full max-w-md flex-col bg-base-100 text-base-content outline-none sm:rounded-l-[var(--radius-modal,1.5rem)] ${closing ? 'drawer-out' : 'drawer-in'}`}>
        <OverlayHeader title={title} subtitle={subtitle} icon={icon} meta={meta} busy={busy} onClose={onClose} titleId={titleId} />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">{children}</div>
        {footer ? <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-line bg-base-100 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6">{footer}</footer> : null}
      </aside>
    </div>,
    document.body,
  );
}
