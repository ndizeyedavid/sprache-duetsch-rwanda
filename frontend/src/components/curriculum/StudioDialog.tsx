import type { ReactNode } from 'react';
import { Dialog } from '../ui/overlay/Dialog';

type Props = { title: string; children: ReactNode; onClose: () => void; wide?: boolean; busy?: boolean };

/** Course-studio dialogs (modules, lessons) on the shared red dialog. Mounted only while open. */
export function StudioDialog({ title, children, onClose, wide = false, busy = false }: Props) {
  return (
    <Dialog open onClose={onClose} busy={busy} title={title} widthClassName={wide ? 'sm:max-w-5xl' : undefined}>
      {children}
    </Dialog>
  );
}
