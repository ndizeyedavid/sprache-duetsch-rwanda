import { isSameDay,subDays } from 'date-fns';

/** Days in a row, ending today (or yesterday if today is still open), with at least one completed lesson. */
export function learningStreak(completedAt: Date[], today = new Date()): number {
  const has = (day: Date) => completedAt.some((date) => isSameDay(date, day));
  let day = has(today) ? today : subDays(today, 1);
  let streak = 0;
  while (has(day)) {
    streak += 1;
    day = subDays(day, 1);
  }
  return streak;
}

type Nudge = { heading: string; text: string };

/** Short German headline + plain-English nudge that matches where the learner is this week. */
export function progressNudge({ weekly, streak, left, total }: { weekly: number; streak: number; left: number; total: number }): Nudge {
  if (!total) return { heading: 'Gleich geht’s los!', text: 'Your lessons appear here as soon as your teacher publishes them.' };
  if (!left) return { heading: 'Fantastisch!', text: 'Every lesson is complete. Revisit your notes or practise for the exam.' };
  if (streak >= 3) return { heading: 'Weiter so!', text: `${streak} days in a row — keep the chain going today.` };
  if (weekly) return { heading: 'Gut gemacht!', text: `${weekly} ${weekly === 1 ? 'lesson' : 'lessons'} this week. One more today keeps the momentum.` };
  return { heading: 'Jeder Tag zählt.', text: 'No lesson yet this week — 15 minutes today is a great start.' };
}
