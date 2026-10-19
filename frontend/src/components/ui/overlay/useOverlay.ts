import type { RefObject } from 'react';
import { useEffect,useRef,useState } from 'react';

export const EXIT_MS = 180;
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Open overlays, newest last: only the top one answers Escape and keeps focus. */
const stack: symbol[] = [];

/**
 * Shared overlay behaviour: stays mounted for the exit animation, locks page scroll, closes on
 * Escape (unless busy), keeps Tab inside the panel, and returns focus to where it came from.
 */
export function useOverlay(open: boolean, onClose: () => void, busy: boolean, panel: RefObject<HTMLElement | null>) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    if (open) { setMounted(true); setClosing(false); return; }
    if (!mounted) return;
    setClosing(true);
    const timer = window.setTimeout(() => { setMounted(false); setClosing(false); }, EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const id = Symbol('overlay');
    stack.push(id);
    document.documentElement.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel.current)?.focus({ preventScroll: true });
    }, 30);
    const onKey = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) return;
      if (event.key === 'Escape' && !busyRef.current) { event.stopPropagation(); closeRef.current(); }
      if (event.key !== 'Tab' || !panel.current) return;
      const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const [first, last] = [items[0], items[items.length - 1]];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey, true);
      stack.splice(stack.indexOf(id), 1);
      if (!stack.length) document.documentElement.style.overflow = '';
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, panel]);

  return { mounted, closing };
}
