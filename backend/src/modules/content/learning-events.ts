import { env } from "../../config/env.js";
import { loadStudentAccessProfile } from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";

/** XP a day needs to "reach the daily goal" (two to three practice sessions). */
export const DAILY_GOAL_XP = 30;
const DAY = 86_400_000;

/** A finished practice session: 10 XP, plus 5 when at least 90% was right first time. */
export const sessionXp = (score: number) => 10 + (score >= 0.9 ? 5 : 0);

type PracticeEvent = { studentId: string; activityId: string; lessonId: string; levelId: string; score: number; total: number; seconds: number };

export function recordPractice(event: PracticeEvent) {
  const { score, total, seconds, ...ids } = event;
  return prisma.learningEvent.create({ data: {
    ...ids, kind: "PRACTICE", xp: sessionXp(score), total, correct: Math.round(score * total),
    seconds: Math.max(0, Math.min(Math.round(seconds), 7200)),
  } });
}

/** A lesson completed by hand (without finishing its practice) still counts as a learning day. */
export function recordLessonCompleted(studentId: string, lessonId: string) {
  return prisma.learningEvent.create({ data: { studentId, lessonId, kind: "LESSON", xp: 5 } });
}

/** Calendar day in the school's time zone (Africa/Kigali), e.g. "2026-10-22". */
const dayKey = (date: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: env.REMINDER_TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);

/** XP today, the streak (days in a row with learning, ending today or yesterday), the last 7 days. */
export async function getMyProgress(userId: string) {
  const profile = await loadStudentAccessProfile(userId);
  const [events, total] = await Promise.all([
    prisma.learningEvent.findMany({ where: { studentId: profile.studentId, createdAt: { gte: new Date(Date.now() - 400 * DAY) } }, select: { xp: true, createdAt: true } }),
    prisma.learningEvent.aggregate({ where: { studentId: profile.studentId }, _sum: { xp: true } }),
  ]);
  const xpByDay = new Map<string, number>();
  for (const event of events) xpByDay.set(dayKey(event.createdAt), (xpByDay.get(dayKey(event.createdAt)) ?? 0) + event.xp);
  const daysAgo = (offset: number) => dayKey(new Date(Date.now() - offset * DAY));
  let offset = xpByDay.has(daysAgo(0)) ? 0 : 1;
  let streak = 0;
  while (xpByDay.has(daysAgo(offset))) { streak += 1; offset += 1; }
  return {
    xpToday: xpByDay.get(daysAgo(0)) ?? 0,
    dailyGoal: DAILY_GOAL_XP,
    streak,
    totalXp: total._sum.xp ?? 0,
    week: Array.from({ length: 7 }, (_, index) => ({ date: daysAgo(6 - index), xp: xpByDay.get(daysAgo(6 - index)) ?? 0 })),
  };
}
