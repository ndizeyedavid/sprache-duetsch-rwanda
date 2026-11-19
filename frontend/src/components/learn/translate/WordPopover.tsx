import { useEffect,useRef } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { SayButton } from '../audio/SayButton';
import type { Entry } from '../types';

type Props = { word: string; entry: Entry | undefined; anchor: DOMRect; onClose: () => void };

/** Meaning of a tapped word, placed under it (above when there is no room), closed by Esc or a tap outside. */
export function WordPopover({ word, entry, anchor, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) onClose(); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', escape);
    window.addEventListener('scroll', onClose, { passive: true, once: true });
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', escape); window.removeEventListener('scroll', onClose); };
  }, [onClose]);
  // Positioning math in px from the viewport; the card itself is sized in rem like the rest of the UI.
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const width = Math.min(18 * rem, window.innerWidth - rem);
  const left = Math.max(rem / 2, Math.min(anchor.left + anchor.width / 2 - width / 2, window.innerWidth - width - rem / 2));
  const below = anchor.bottom + 9 * rem < window.innerHeight;
  const style = below ? { left, top: anchor.bottom + rem / 3, width } : { left, bottom: window.innerHeight - anchor.top + rem / 3, width };
  return createPortal(
    <div ref={ref} role="dialog" aria-label={`Meaning of ${word}`} style={style}
      className="fixed z-[60] rounded-box border border-line bg-base-100 p-3 text-left text-sm text-base-content shadow-lg">
      <div className="flex items-start gap-2">
        <SayButton text={word} audio={entry?.[2]} slow />
        <div className="min-w-0 grow">
          <p className="font-bold" lang="de">{word}</p>
          <p className="mt-0.5 leading-snug">{entry ? entry[0] : 'No translation for this word yet.'}</p>
          {entry?.[1] ? <p className="mt-1 text-xs text-muted">Dictionary form: <span lang="de" className="font-semibold text-base-content">{entry[1]}</span></p> : null}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="btn btn-ghost btn-xs btn-circle"><FiX aria-hidden /></button>
      </div>
    </div>,
    document.body,
  );
}
