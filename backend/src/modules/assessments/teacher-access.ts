import { getTeacherLevelIds } from "../../lib/teacher-levels.js";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { forbidden, notFound } from "../../lib/http-error.js";
export const teacherLevels = async (teacherId?: string): Promise<string[] | null> => teacherId ? getTeacherLevelIds(teacherId) : null;
export const checkTeacherAssessmentAccess = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.user?.role !== "TEACHER") {
      next();
      return;
    }
    const teacherId = req.user.id,
      levels = await teacherLevels(teacherId);
    let levelId =
      (req.body as { levelId?: string } | undefined)?.levelId ??
      (req.query.levelId as string | undefined);
    if (req.params.id) {
      const id = req.params.id as string;
      if (req.path.startsWith("/questions/")) {
        const q = await prisma.question.findUnique({ where: { id }, select: { levelId: true } });
        if (!q) throw notFound();
        if (!levels?.includes(q.levelId)) throw forbidden("You are not assigned to this level");
        levelId ??= q.levelId;
      } else if (req.path.startsWith("/assessments/")) {
        const a = await prisma.assessment.findUnique({ where: { id }, select: { levelId: true } });
        if (!a) throw notFound();
        if (!levels?.includes(a.levelId)) throw forbidden("You are not assigned to this level");
        levelId ??= a.levelId;
      } else if (req.path.startsWith("/attempts/")) {
        const a = await prisma.attempt.findFirst({
          where: {
            id,
            student: { enrollments: { some: { classGroup: { teacherId }, status: "ACTIVE" } } },
            assessment: { levelId: { in: levels ?? [] } },
          },
          select: { id: true },
        });
        if (!a) throw notFound("Attempt not found in your classes");
      }
    }
    if (levelId && !levels?.includes(levelId))
      throw forbidden("You are not assigned to this level");
    const classGroupId = req.query.classGroupId as string | undefined;
    if (
      classGroupId &&
      !(await prisma.classGroup.findFirst({ where: { id: classGroupId, teacherId } }))
    )
      throw forbidden("You are not assigned to this class");
    const studentId = req.query.studentId as string | undefined;
    if (
      studentId &&
      !(await prisma.enrollment.findFirst({
        where: { studentId, status: "ACTIVE", classGroup: { teacherId } },
      }))
    )
      throw forbidden("Student is not in your classes");
    const questions = (req.body as { questions?: { questionId: string }[] } | undefined)?.questions;
    if (questions?.length && levelId) {
      const count = await prisma.question.count({
        where: { id: { in: questions.map((q) => q.questionId) }, levelId },
      });
      if (count !== new Set(questions.map((q) => q.questionId)).size)
        throw forbidden("Questions must belong to the assessment level");
    }
    next();
  } catch (e) {
    next(e);
  }
};
