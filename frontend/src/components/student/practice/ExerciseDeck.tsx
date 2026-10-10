import { useState } from 'react';
import { FiArrowLeft,FiArrowRight,FiEdit3 } from 'react-icons/fi';
import { PracticeItem } from './PracticeItem';
import type { Activity } from './types';
export function ExerciseDeck({ activities }: { activities: Activity[] }) {
  const [active, setActive] = useState(0);
  return <section className="card border border-base-300 bg-base-100 p-4 sm:p-6" aria-label="Course exercises">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-base-300 pb-4">
      <h2 className="flex items-center gap-2 font-bold"><FiEdit3 className="text-primary" aria-hidden />Exercises</h2>
      <select className="select select-sm w-auto max-w-full" aria-label="Choose exercise" value={active} onChange={e => setActive(Number(e.target.value))}>
        {activities.map((a, i) => <option key={a.id} value={i}>Exercise {i + 1} of {activities.length} · {a.title}</option>)}
      </select>
    </div>
    {activities.map((activity, index) => <div key={activity.id} hidden={index !== active}><PracticeItem activity={activity} /></div>)}
    <nav className="mt-5 flex justify-between gap-3" aria-label="Exercise navigation">
      <button className="btn btn-sm btn-ghost" disabled={active === 0} onClick={() => setActive(active - 1)}><FiArrowLeft aria-hidden />Previous</button>
      <button className="btn btn-sm btn-outline" disabled={active === activities.length - 1} onClick={() => setActive(active + 1)}>Next exercise<FiArrowRight aria-hidden /></button>
    </nav>
  </section>;
}
