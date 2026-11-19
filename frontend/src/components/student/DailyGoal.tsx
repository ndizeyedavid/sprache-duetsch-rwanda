import { FiTarget } from 'react-icons/fi';

/** XP earned today against the daily goal (practice sessions earn 10–15 XP each). */
export function DailyGoal({ xpToday, dailyGoal }: { xpToday: number; dailyGoal: number }) {
  const reached = xpToday >= dailyGoal;
  return <div className="mx-4 mt-3 rounded-box bg-base-100 p-3">
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="inline-flex items-center gap-1.5 font-semibold"><FiTarget aria-hidden className="text-primary" />Daily goal</span>
      <span className="tabular-nums text-muted">{Math.min(xpToday, dailyGoal)} / {dailyGoal} XP</span>
    </div>
    <progress className="progress progress-primary mt-2 h-2 w-full" value={Math.min(xpToday, dailyGoal)} max={dailyGoal} aria-label="Daily goal progress" />
    <p className="mt-1.5 text-[0.6875rem] text-muted">{reached ? 'Goal reached — sehr gut! Come back tomorrow to keep your streak.' : 'Finish 2–3 practice sessions to reach today’s goal.'}</p>
  </div>;
}
