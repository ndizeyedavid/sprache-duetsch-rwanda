import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiPlus } from 'react-icons/fi';
import type { TaskKind } from './task-types';
import { KINDS } from './task-types';

/** "New" button that asks what to create, with one line on each choice. */
export function NewTaskMenu({ onCreate }: { onCreate: (kind: TaskKind) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => { if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close); document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen(o => !o)} className="btn rounded-full border-0 bg-brand text-white hover:bg-brand/90">
        <FiPlus aria-hidden />New<FiChevronDown aria-hidden />
      </button>
      {open ? (
        <ul className="absolute right-0 z-30 mt-2 w-80 rounded-box border border-base-300 bg-base-100 p-1.5 shadow-lg">
          {KINDS.map(k => { const Icon = k.icon; return (
            <li key={k.kind}>
              <button type="button" className="flex w-full gap-3 rounded-field p-3 text-left hover:bg-base-200" onClick={() => { setOpen(false); onCreate(k.kind); }}>
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
