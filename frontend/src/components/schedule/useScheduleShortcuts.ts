import { useEffect } from 'react';
import type { ScheduleView } from './constants';

type Handlers = { onPrev: () => void; onNext: () => void; onToday: () => void; onView: (view: ScheduleView) => void };

const VIEW_KEYS: Record<string, ScheduleView> = { d: 'day', w: 'week', m: 'month', l: 'agenda' };

/** ← / → move, T jumps to today, D W M L switch views. Ignored while typing or in a dialog. */
export function useScheduleShortcuts({ onPrev, onNext, onToday, onView }: Handlers) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], dialog[open]')) return;
      const key = event.key.toLowerCase();
      if (key === 'arrowleft') onPrev();
      else if (key === 'arrowright') onNext();
      else if (key === 't') onToday();
      else if (VIEW_KEYS[key]) onView(VIEW_KEYS[key]);
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPrev, onNext, onToday, onView]);
}
