// Usage (from backend/): npx tsx prisma/course-import/lesson-photos/apply-lesson-photos.ts [--apply]
// Dry-run by default. --apply backs up the touched lesson bodies to backups/ first.
import { access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { prisma } from "../../../src/lib/prisma.js";
import { writeBackup } from "../backup.js";
import { planPhotoChanges, referencedPhotos } from "./plan.js";

const apply = process.argv.includes("--apply");
const publicDir = new URL("../../../../frontend/public/coursebook/photos/", import.meta.url);

try {
  const rows = await prisma.lesson.findMany({
    select: { id: true, title: true, body: true, module: { select: { level: { select: { code: true } } } } },
  });
  const changes = planPhotoChanges(rows.map((row) => ({ id: row.id, title: row.title, body: row.body, level: row.module.level.code })));

  // When the frontend sits next to the backend (dev, CI) make sure every photo really exists.
  const missing: string[] = [];
  const frontendPresent = await access(fileURLToPath(publicDir)).then(() => true, () => false);
  if (frontendPresent) {
    for (const file of referencedPhotos(changes.map((c) => c.after))) {
      await access(fileURLToPath(new URL(file, publicDir))).catch(() => missing.push(file));
    }
  }
  const byLevel: Record<string, number> = {};
  for (const change of changes) byLevel[change.level] = (byLevel[change.level] ?? 0) + 1;
  const summary = { mode: apply ? "apply" : "dry-run", lessons: rows.length, changed: changes.length, byLevel,
    photoFilesChecked: frontendPresent, missing };
  if (missing.length) throw new Error(`Missing photo files: ${missing.join(", ")}`);
  if (!apply) {
    console.log(JSON.stringify({ ...summary, sample: changes.slice(0, 5).map(({ title, level, reason }) => ({ title, level, reason })) }, null, 2));
  } else {
    const backup = await writeBackup("lesson-photos", changes.map(({ id, before }) => ({ id, body: before })));
    await prisma.$transaction(async (tx) => {
      for (const change of changes) await tx.lesson.update({ where: { id: change.id }, data: { body: change.after } });
      await tx.auditLog.create({ data: { action: "CURRICULUM_IMPORTED", entityType: "Lesson", entityId: "lesson-photos",
        reason: "Self-hosted, credit-free lesson photos", after: { changed: changes.length, byLevel } } });
    }, { timeout: 120_000 });
    console.log(JSON.stringify({ ...summary, backup }, null, 2));
  }
} finally {
  await prisma.$disconnect();
}
