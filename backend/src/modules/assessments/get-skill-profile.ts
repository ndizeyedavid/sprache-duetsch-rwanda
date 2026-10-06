import { prisma } from "../../lib/prisma.js";
export const getSkillProfile = async (studentId: string) => {
  const answers = await prisma.answer.findMany({
    where: { attempt: { studentId, score: { not: null } } },
    select: {
      pointsAwarded: true,
      question: { select: { skill: true, points: true } },
    },
  });

  const bySkill = new Map<string, { answered: number; earned: number; possible: number }>();
  for (const answer of answers) {
    const entry = bySkill.get(answer.question.skill) ?? { answered: 0, earned: 0, possible: 0 };
    entry.answered += 1;
    entry.earned += Number(answer.pointsAwarded ?? 0);
    entry.possible += Number(answer.question.points);
    bySkill.set(answer.question.skill, entry);
  }

  return [...bySkill.entries()]
    .map(([skill, stats]) => ({
      skill,
      ...stats,
      percentage: stats.possible > 0 ? Math.round((stats.earned / stats.possible) * 100) : 0,
    }))
    .sort((a, b) => a.skill.localeCompare(b.skill));
};
