import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/** daisyUI modal on a native <dialog>: ESC and backdrop clicks call `onClose`. */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle" onClose={onClose}>
      <div className="modal-box rounded-modal">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        <div className="mt-4">{open ? children : null}</div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" aria-label="Close">
          close
        </button>
      </form>
    </dialog>
  );
}
