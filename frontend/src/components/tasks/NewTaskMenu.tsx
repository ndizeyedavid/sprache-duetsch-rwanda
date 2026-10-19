import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiPlus } from 'react-icons/fi';
import type { TaskKind } from './task-types';
import { KINDS } from './task-types';

const brandButton = 'btn rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content';
type Place = { top: number; left: number };

/**
 * "New" button that asks what to create, with one line on each choice. The menu is fixed-positioned
 * under the button so it is never clipped by a rounded hero card (`overflow-hidden`).
 */
export function NewTaskMenu({ onCreate, className = brandButton }: { onCreate: (kind: TaskKind) => void; className?: string }) {
  const [place, setPlace] = useState<Place | null>(null);
  const ref = useRef<HTMLDivElement>(null), button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!place) return;
    const close = (e: Event) => { if (e instanceof KeyboardEvent ? e.key === 'Escape' : e.type !== 'mousedown' || !ref.current?.contains(e.target as Node)) setPlace(null); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', close);
    window.addEventListener('resize', close); window.addEventListener('scroll', close, true);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); window.removeEventListener('resize', close); window.removeEventListener('scroll', close, true); };
  }, [place]);
  function toggle() {
    const rect = button.current?.getBoundingClientRect();
    if (place || !rect) { setPlace(null); return; }
    const width = Math.min(320, window.innerWidth - 16);
    setPlace({ top: rect.bottom + 8, left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) });
  }
  return (
    <div ref={ref} className="relative">
      <button ref={button} type="button" aria-expanded={Boolean(place)} onClick={toggle} className={className}>
        <FiPlus aria-hidden />New<FiChevronDown aria-hidden />
      </button>
      {place ? (
        <ul style={place} className="fixed z-50 w-80 max-w-[calc(100vw-1rem)] rounded-box border border-base-300 bg-base-100 p-1.5 text-base-content">
          {KINDS.map(k => { const Icon = k.icon; return (
            <li key={k.kind}>
              <button type="button" className="flex w-full gap-3 rounded-field p-3 text-left hover:bg-base-200" onClick={() => { setPlace(null); onCreate(k.kind); }}>
                <Icon aria-hidden className="mt-0.5 shrink-0 text-brand" />
                <span><span className="block text-sm font-semibold">{k.label}</span><span className="mt-0.5 block text-xs leading-5 text-muted">{k.hint}</span></span>
              </button>
            </li>
          ); })}
        </ul>
      ) : null}
    </div>
  );
}
