import { addDays,addMonths,addWeeks,endOfWeek,format,isSameDay,isValid,parseISO,startOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ScheduleView } from './constants';
import { VIEWS } from './constants';

/** Phones open on a single day; wider screens on the week. */
const defaultView = (): ScheduleView =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches ? 'day' : 'week';

/** Calendar view + anchor date kept in the URL (`?view=&date=`), so refresh and back keep your place. */
export function useScheduleNavigation() {
  const [params, setParams] = useSearchParams();
  const raw = params.get('view');
  const view: ScheduleView = (VIEWS as readonly string[]).includes(raw ?? '') ? raw as ScheduleView : defaultView();
  const date = params.get('date');
  const anchor = useMemo(() => { const parsed = date ? parseISO(date) : new Date(); return isValid(parsed) ? parsed : new Date(); }, [date]);
  function update(values: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => { if (value) next.set(key, value); else next.delete(key); });
    setParams(next, { replace: true });
  }
  function inRange(startAt: string) {
    const d = new Date(startAt);
    if (view === 'agenda') return true;
    if (view === 'day') return isSameDay(d, anchor);
    if (view === 'month') return d.getMonth() === anchor.getMonth() && d.getFullYear() === anchor.getFullYear();
    return d >= startOfWeek(anchor, { weekStartsOn: 1 }) && d <= endOfWeek(anchor, { weekStartsOn: 1 });
  }
  const setAnchor = (d: Date) => update({ date: format(d, 'yyyy-MM-dd') });
  return {
    view, anchor, update, inRange, setAnchor,
    setView: (v: ScheduleView) => update({ view: v }),
    pickDay: (d: Date) => update({ date: format(d, 'yyyy-MM-dd'), view: 'day' }),
    step: (n: number) => setAnchor(view === 'month' ? addMonths(anchor, n) : view === 'day' ? addDays(anchor, n) : addWeeks(anchor, n)),
  };
}

export type ScheduleNavigation = ReturnType<typeof useScheduleNavigation>;
