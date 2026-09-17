import { useEffect, useRef, useState } from 'react';
import { FiMoreVertical } from 'react-icons/fi';
import type { IconType } from 'react-icons';

type Item = { label: string; icon: IconType; onClick: () => void; tone?: 'default' | 'danger'; disabled?: boolean };

type Props = { label: string; items: Item[] };

export function RowMenu({ label, items }: Props) {
 const [open, setOpen] = useState(false);
 const ref = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (!open) return;
 function onDown(e: MouseEvent) {
 if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
 }
 function onKey(e: KeyboardEvent) {
 if (e.key === 'Escape') setOpen(false);
 }
 document.addEventListener('mousedown', onDown);
 document.addEventListener('keydown', onKey);
 return () => {
 document.removeEventListener('mousedown', onDown);
 document.removeEventListener('keydown', onKey);
 };
 }, [open]);

 return (
 <div ref={ref} className="relative">
 <button type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} className={`btn btn-ghost btn-sm btn-circle ${open ? 'bg-base-200' : 'text-muted hover:text-ink'}`}>
 <FiMoreVertical aria-hidden />
 </button>
 {open ? (
 <ul role="menu" className="menu absolute right-0 top-9 z-20 w-48 rounded-box border border-line bg-base-100 p-2">
 {items.map((item) => {
 const Icon = item.icon;
 return (
 <li key={item.label}>
 <button
 type="button"
 role="menuitem"
 disabled={item.disabled}
 onClick={() => {
 setOpen(false);
 item.onClick();
 }}
 className={`flex items-center gap-3 text-xs ${item.tone === 'danger' ? 'text-coral hover:bg-coral-soft' : 'hover:bg-base-200'} disabled:opacity-40`}
 >
 <Icon aria-hidden className="text-sm" />
 {item.label}
 </button>
 </li>
 );
 })}
 </ul>
 ) : null}
 </div>
 );
}
