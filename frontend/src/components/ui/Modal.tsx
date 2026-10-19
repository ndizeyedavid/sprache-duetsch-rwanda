import type { ReactNode } from 'react';
import { Dialog } from './overlay/Dialog';
import { useLastValue } from './overlay/useLastValue';

type ModalProps = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Extra width for wide content such as a certificate, e.g. "max-w-3xl". */
  boxClassName?: string;
};

// Written out in full: Tailwind only generates classes it can find in the source, never a built `sm:${c}`.
const WIDTHS: Record<string, string> = {
  'max-w-md': 'sm:max-w-md', 'max-w-lg': 'sm:max-w-lg', 'max-w-xl': 'sm:max-w-xl', 'max-w-2xl': 'sm:max-w-2xl',
  'max-w-3xl': 'sm:max-w-3xl', 'max-w-4xl': 'sm:max-w-4xl', 'max-w-5xl': 'sm:max-w-5xl', 'max-w-6xl': 'sm:max-w-6xl', 'max-w-7xl': 'sm:max-w-7xl',
};

/** Any max-w-* in boxClassName becomes the desktop width (phones always get a full-width sheet). */
const widthFrom = (boxClassName: string) => boxClassName.split(/\s+/).map((c) => WIDTHS[c]).filter(Boolean).join(' ') || undefined;

/**
 * The app-wide modal: same red-header dialog as the schedule editor, rendered at <body>,
 * with a soft backdrop, Escape/backdrop to close (unless busy) and an enter/exit animation.
 */
export function Modal({ open, onClose, title, children, boxClassName = '', busy = false }: ModalProps) {
  const content = useLastValue(open ? children : null);
  return (
    <Dialog open={open} onClose={onClose} busy={busy} title={title} widthClassName={widthFrom(boxClassName)}>
      {content}
    </Dialog>
  );
}
