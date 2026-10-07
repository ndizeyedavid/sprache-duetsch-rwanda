import type { ReactNode } from 'react';
import { useEffect,useId,useRef } from 'react';

type ModalProps = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Extra classes on the dialog box, for wide content such as a certificate. */
  boxClassName?: string;
};

/** daisyUI modal on a native <dialog>: ESC and backdrop clicks call `onClose`. */
export function Modal({ open, onClose, title, children, boxClassName = '', busy = false }: ModalProps) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle" aria-labelledby={titleId} onClose={onClose} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
      <div className={`modal-box rounded-modal ${boxClassName}`}>
        <div className="flex items-center justify-between gap-3"><h3 id={titleId} className="text-base font-semibold text-ink">{title}</h3><button type="button" aria-label="Close dialog" disabled={busy} onClick={onClose} className="btn btn-ghost btn-sm btn-circle">✕</button></div>
        <div className="mt-4">{open ? children : null}</div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={event => { event.preventDefault(); if (!busy) onClose(); }}>
        <button type="submit" disabled={busy} aria-label="Close">
          close
        </button>
      </form>
    </dialog>
  );
}
