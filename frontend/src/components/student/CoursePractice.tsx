import { FiZap } from 'react-icons/fi';
import { isBookPractice } from './course-practice-utils';
import { ExerciseDeck } from './practice/ExerciseDeck';
import { PracticeItem } from './practice/PracticeItem';
import type { Activity } from './practice/types';
export function CoursePractice({ activities }: { activities: Activity[] }) {
  const practice = activities.filter(isBookPractice);
  if (!practice.length) return null;
  const quick = practice.filter(a => a.title === 'Quick check');
  const exercises = practice.filter(a => a.title !== 'Quick check');
  return <section id="lesson-practice" className="scroll-mt-24 space-y-5" aria-label="Practice">
    {quick.map(a => <div key={a.id} className="card border border-base-300 bg-base-100 p-5">
      <h2 className="mb-4 flex items-center gap-2 font-bold"><FiZap className="text-primary" aria-hidden />Quick check</h2>
      <PracticeItem activity={a} />
    </div>)}
    {exercises.length ? <ExerciseDeck activities={exercises} /> : null}
  </section>;
}
