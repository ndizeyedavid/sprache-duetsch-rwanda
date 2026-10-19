import { z } from "zod";
import { prisma } from "../../lib/prisma.js";

export const levelsOverviewQuerySchema = z.object({ intakeId: z.string().min(1).optional() });
export type LevelsOverviewQuery = z.infer<typeof levelsOverviewQuerySchema>;

type CurriculumRow = { levelId: string; modules: bigint; lessons: bigint; published: bigint; minutes: bigint | null; activities: bigint };
type CoverRow = { levelId: string; photo: string };

/**
 * Course catalogue for academic staff: per level, the curriculum size (archived seed modules
 * excluded), up to three lesson photos, and who is learning it (active enrolments, classes,
 * teachers — following the staff intake scope). No money: academic admins have no finance access.
 */
export async function levelsOverview({ intakeId }: LevelsOverviewQuery) {
  const [curriculum, covers, enrollments, classes] = await Promise.all([
    prisma.$queryRaw<CurriculumRow[]>`
      SELECT m."levelId",
        count(DISTINCT m.id) AS modules,
        count(l.id) AS lessons,
        count(l.id) FILTER (WHERE l."isPublished") AS published,
        sum(l."estimatedMinutes") AS minutes,
        (SELECT count(*) FROM "Activity" a JOIN "Lesson" al ON al.id = a."lessonId" JOIN "Module" am ON am.id = al."moduleId"
          WHERE am."levelId" = m."levelId" AND NOT (am."order" < 0 AND NOT am."isPublished")) AS activities
      FROM "Module" m LEFT JOIN "Lesson" l ON l."moduleId" = m.id
      WHERE NOT (m."order" < 0 AND NOT m."isPublished")
      GROUP BY m."levelId"`,
    prisma.$queryRaw<CoverRow[]>`
      SELECT "levelId", photo FROM (
        SELECT m."levelId", substring(l.body from '/coursebook/photos/[A-Za-z0-9._-]+\\.webp') AS photo,
          row_number() OVER (PARTITION BY m."levelId" ORDER BY m."order", l."order") AS n
        FROM "Lesson" l JOIN "Module" m ON m.id = l."moduleId"
        WHERE m."order" >= 0 AND l.body LIKE '%/coursebook/photos/%') ranked
      WHERE n <= 3`,
    prisma.enrollment.groupBy({ by: ["levelId"], where: { status: "ACTIVE", intakeId }, _count: { _all: true } }),
    prisma.classGroup.findMany({ where: { isActive: true, intakeId }, select: { levelId: true, teacherId: true } }),
  ]);
  return new Map([...new Set([...curriculum.map((r) => r.levelId), ...enrollments.map((r) => r.levelId), ...classes.map((r) => r.levelId)])]
    .map((levelId) => {
      const c = curriculum.find((row) => row.levelId === levelId);
      const levelClasses = classes.filter((row) => row.levelId === levelId);
      return [levelId, {
        modules: Number(c?.modules ?? 0), lessons: Number(c?.lessons ?? 0), publishedLessons: Number(c?.published ?? 0),
        activities: Number(c?.activities ?? 0), minutes: Number(c?.minutes ?? 0),
        covers: covers.filter((row) => row.levelId === levelId).map((row) => row.photo),
        students: enrollments.find((row) => row.levelId === levelId)?._count._all ?? 0,
        classes: levelClasses.length,
        teachers: new Set(levelClasses.map((row) => row.teacherId).filter(Boolean)).size,
      }] as const;
    }));
}

/** JSON-friendly list keyed by level id. */
export const levelsOverviewList = async (query: LevelsOverviewQuery) =>
  [...(await levelsOverview(query)).entries()].map(([levelId, stats]) => ({ levelId, ...stats }));
