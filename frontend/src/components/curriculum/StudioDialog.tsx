import type { ReactNode } from 'react';
import { useEffect,useId,useRef } from 'react';
import { FiX } from 'react-icons/fi';

type Props = { title: string; children: ReactNode; onClose: () => void; wide?: boolean; busy?: boolean };

export function StudioDialog({ title, children, onClose, wide = false, busy = false }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className="modal modal-bottom sm:modal-middle" aria-labelledby={titleId}
      onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>
      <div className={`modal-box max-h-[90dvh] p-0 ${wide ? 'w-[min(960px,95vw)] max-w-none' : 'max-w-xl'}`}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-base-100 px-6 py-5">
          <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
          <button type="button" className="btn btn-sm btn-circle btn-ghost" aria-label="Close dialog" disabled={busy} onClick={onClose}><FiX aria-hidden /></button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
      <form method="dialog" className="modal-backdrop" onSubmit={event => { event.preventDefault(); if (!busy) onClose(); }}>
        <button aria-label="Close dialog" disabled={busy}>Close</button>
      </form>
    </dialog>
  );
}
