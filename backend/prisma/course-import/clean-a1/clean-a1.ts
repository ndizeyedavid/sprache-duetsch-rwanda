// Remove A1 test/demo leftovers. Dry-run by default.
// Usage (from backend/): npx tsx prisma/course-import/clean-a1/clean-a1.ts [--apply] [--republish-imported]
import { prisma } from "../../../src/lib/prisma.js";
import { a1ImportIds, loadA1Manifest } from "../a1-manifest.js";
import { writeBackup } from "../backup.js";
import { executeSteps } from "./execute.js";
import { planCurriculum } from "./plan-curriculum.js";
import { planExtras } from "./plan-extras.js";

const apply = process.argv.includes("--apply");
const republish = process.argv.includes("--republish-imported");

try {
  const { book } = await loadA1Manifest();
  const level = await prisma.level.findUniqueOrThrow({ where: { code: "A1" } });
  const steps = [...await planCurriculum(level, a1ImportIds(book), republish), ...await planExtras(level.id)];
  for (const step of steps) console.log(`[${step.action}] ${step.kind} "${step.title}" (${step.id}) — ${step.reason}`);
  const counts = Object.fromEntries(["delete", "unpublish", "republish", "keep"].map((action) => [action, steps.filter((s) => s.action === action).length]));
  if (!apply) {
    console.log(JSON.stringify({ level: level.code, mode: "dry-run", ...counts }));
  } else if (steps.every((s) => s.action === "keep")) {
    console.log(JSON.stringify({ level: level.code, mode: "applied", changes: 0 }));
  } else {
    // Snapshot everything the plan touches (with student work) before changing anything.
    const backup = await writeBackup("a1-clean", {
      level, steps,
      modules: await prisma.module.findMany({ where: { levelId: level.id }, include: { lessons: { include: {
        materials: true, progress: true, activities: { include: { submissions: true } },
      } } } }),
      assessments: await prisma.assessment.findMany({ where: { levelId: level.id }, include: { questions: true } }),
      questions: await prisma.question.findMany({ where: { id: { in: steps.filter((s) => s.kind === "question").map((s) => s.id) } } }),
      assignments: await prisma.assignment.findMany({ where: { id: { in: steps.filter((s) => s.kind === "assignment").map((s) => s.id) } } }),
    });
    console.log(JSON.stringify({ level: level.code, mode: "applied", backup, ...await executeSteps(level, steps) }));
  }
} finally {
  await prisma.$disconnect();
}
