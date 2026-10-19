import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { FiX } from 'react-icons/fi';

type Props = { /** Grab handle hint for the phone bottom sheet (dialogs only). */ handle?: boolean; title: ReactNode; subtitle?: ReactNode; icon?: IconType; meta?: ReactNode; busy?: boolean; onClose: () => void; titleId: string };

/** Brand-red header shared by dialogs and drawers: icon, title, one line of context, close. */
export function OverlayHeader({ handle = false, title, subtitle, icon: Icon, meta, busy, onClose, titleId }: Props) {
  return (
    <header className="hero-band relative shrink-0 px-5 pb-4 pt-5 sm:px-6">
      {handle ? <span aria-hidden className="mx-auto -mt-2 mb-3 block h-1 w-10 rounded-full bg-primary-content sm:hidden" /> : null}
      <div className="flex items-start gap-3 pr-10">
        {Icon ? <span className="grid size-10 shrink-0 place-items-center rounded-box bg-base-100 text-primary"><Icon aria-hidden className="text-lg" /></span> : null}
        <div className="min-w-0">
          <h2 id={titleId} className="text-lg font-semibold leading-tight">{title}</h2>
          {subtitle ? <div className="mt-1 text-xs leading-5">{subtitle}</div> : null}
        </div>
      </div>
      {meta ? <div className="mt-3 flex flex-wrap gap-1.5">{meta}</div> : null}
      <button type="button" onClick={onClose} disabled={busy} aria-label="Close"
        className="btn btn-circle btn-sm absolute right-4 top-4 border-primary-content bg-transparent text-primary-content hover:bg-primary-content hover:text-primary">
        <FiX aria-hidden />
      </button>
    </header>
  );
}
