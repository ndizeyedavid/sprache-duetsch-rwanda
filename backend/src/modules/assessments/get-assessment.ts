import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const getAssessment = async (id: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" }, include: { question: true } },
      _count: { select: { attempts: true } },
    },
  });

  if (!assessment) {
    throw notFound("Assessment not found");
  }

  return assessment;
};
