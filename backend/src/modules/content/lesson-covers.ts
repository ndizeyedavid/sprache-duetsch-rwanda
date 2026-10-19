import { prisma } from "../../lib/prisma.js";

/**
 * Lead photo of every lesson in a level, pulled straight out of the stored body by Postgres so
 * the CMS list never ships lesson bodies. Lessons without a self-hosted photo are simply absent.
 */
export async function lessonCovers(levelId: string): Promise<Map<string, string>> {
  const rows = await prisma.$queryRaw<{ id: string; photo: string | null }[]>`
    SELECT l.id, substring(l.body from '/coursebook/photos/[A-Za-z0-9._-]+\\.webp') AS photo
    FROM "Lesson" l JOIN "Module" m ON m.id = l."moduleId"
    WHERE m."levelId" = ${levelId} AND l.body LIKE '%/coursebook/photos/%'`;
  return new Map(rows.flatMap((row) => (row.photo ? [[row.id, row.photo] as const] : [])));
}
