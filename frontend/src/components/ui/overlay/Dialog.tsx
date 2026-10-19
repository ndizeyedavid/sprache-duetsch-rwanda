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
  /** Chips under the title (in the red header). */
  meta?: ReactNode;
  /** Pinned under the scrolling body: the primary actions are always visible. */
  footer?: ReactNode;
  busy?: boolean;
  size?: 'sm' | 'md' | 'lg';
  /** Explicit desktop width (e.g. "sm:max-w-7xl") for wide content; overrides `size`. */
  widthClassName?: string;
  children: ReactNode;
};

const WIDTH = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl' };

/**
 * Centered dialog on desktop, bottom sheet on phones. Rendered at <body> so no page layout can
 * trap it; red header, scrolling body, pinned footer, enter/exit animation.
 */
export function Dialog({ open, onClose, title, subtitle, icon, meta, footer, busy = false, size = 'md', widthClassName, children }: Props) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { mounted, closing } = useOverlay(open, onClose, busy, panel);
  if (!mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <Backdrop closing={closing} busy={busy} onClose={onClose} />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        className={`overlay-panel relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[var(--radius-modal,1.5rem)] bg-base-100 text-base-content outline-none sm:max-h-[88dvh] sm:rounded-[var(--radius-modal,1.5rem)] ${widthClassName ?? WIDTH[size]} ${closing ? 'dialog-out' : 'dialog-in'}`}>
        <OverlayHeader handle title={title} subtitle={subtitle} icon={icon} meta={meta} busy={busy} onClose={onClose} titleId={titleId} />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{children}</div>
        {footer ? <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-line bg-base-100 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:px-6">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
