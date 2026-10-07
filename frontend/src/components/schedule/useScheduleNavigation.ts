import { addMonths,addWeeks,endOfWeek,format,isValid,parseISO,startOfWeek } from 'date-fns';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ScheduleView } from './constants';
export function useScheduleNavigation() {
  const [params, setParams] = useSearchParams();
  const view: ScheduleView = params.get('view') === 'agenda' ? 'agenda' : params.get('view') === 'week' ? 'week' : 'month';
  const date = params.get('date');
  const anchor = useMemo(() => { const parsed = date ? parseISO(date) : new Date(); return isValid(parsed) ? parsed : new Date(); }, [date]);
  function update(values: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key,value]) => { if (value) next.set(key,value); else next.delete(key); });
    setParams(next, { replace: true });
  }
  function inRange(startAt: string) {
    if (view === 'agenda') return true;
    const d = new Date(startAt);
    return view === 'month' ? d.getMonth() === anchor.getMonth() && d.getFullYear() === anchor.getFullYear() : d >= startOfWeek(anchor,{weekStartsOn:1}) && d <= endOfWeek(anchor,{weekStartsOn:1});
  }
  return { view, anchor, update, inRange,
    setView: (v: ScheduleView) => update({view:v === 'month' ? null : v}),
    setAnchor: (d: Date) => update({date:format(d,'yyyy-MM-dd')}),
    pickDay: (d: Date) => update({date:format(d,'yyyy-MM-dd'),view:'week'}),
    step: (n: number) => update({date:format(view === 'month' ? addMonths(anchor,n) : addWeeks(anchor,n),'yyyy-MM-dd')}),
  };
}
