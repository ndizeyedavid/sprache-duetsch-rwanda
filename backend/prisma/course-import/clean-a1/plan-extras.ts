// Plan the cleanup of A1 assessments, question-bank entries and class assignments.
import { prisma } from "../../../src/lib/prisma.js";
import { testReason } from "./signals.js";
import type { Steps } from "./types.js";
import { workLabel } from "./types.js";

/** Creation times of test assessments that staff already deleted (their questions stay behind). */
async function deletedTestAssessments(levelId: string) {
  const rows = await prisma.auditLog.findMany({ where: { action: "ASSESSMENT_DELETED", entityType: "Assessment" } });
  return rows.flatMap((row) => {
    const before = (row.before ?? {}) as { levelId?: string; title?: string; createdAt?: string };
    if (before.levelId !== levelId || !before.createdAt || !testReason(before.title)) return [];
    return [{ title: before.title ?? "", at: Date.parse(before.createdAt) }];
  });
}

export async function planExtras(levelId: string): Promise<Steps> {
  const steps: Steps = [];
  const deleted = new Set<string>();
  const assessments = await prisma.assessment.findMany({ where: { levelId }, include: { _count: { select: { attempts: true } } } });
  for (const assessment of assessments) {
    const reason = testReason(assessment.title, assessment.description);
    if (!reason) continue;
    const work = workLabel({ attempts: assessment._count.attempts });
    if (!work) deleted.add(assessment.id);
    steps.push(work
      ? { kind: "assessment", id: assessment.id, title: assessment.title, action: assessment.isPublished ? "unpublish" : "keep", reason: `${reason}; kept: ${work}` }
      : { kind: "assessment", id: assessment.id, title: assessment.title, action: "delete", reason });
  }

  const leftovers = await deletedTestAssessments(levelId);
  const questions = await prisma.question.findMany({
    where: { levelId },
    include: { _count: { select: { answers: true } }, assessments: { select: { assessmentId: true } } },
  });
  for (const question of questions) {
    // Answered questions are student work; questions in a kept assessment stay with it.
    const links = question.assessments.map((link) => link.assessmentId);
    if (question._count.answers > 0 || !links.every((id) => deleted.has(id))) continue;
    const leftover = links.length ? null : leftovers.find((a) => Math.abs(question.createdAt.getTime() - a.at) <= 60_000);
    const reason = testReason(question.prompt)
      ?? (links.length ? "only used by a deleted test assessment" : null)
      ?? (leftover ? `left behind by deleted test assessment "${leftover.title}"` : null);
    if (reason) steps.push({ kind: "question", id: question.id, title: question.prompt.slice(0, 80), action: "delete", reason });
  }

  const assignments = await prisma.assignment.findMany({
    where: { classGroup: { levelId } },
    include: { _count: { select: { submissions: true, files: true } } },
  });
  for (const assignment of assignments) {
    const reason = testReason(assignment.title, assignment.instructions);
    if (!reason) continue;
    const work = workLabel({ submissions: assignment._count.submissions, files: assignment._count.files });
    steps.push({ kind: "assignment", id: assignment.id, title: assignment.title, action: work ? "keep" : "delete", reason: work ? `${reason}; kept: ${work}` : reason });
  }
  return steps;
}
