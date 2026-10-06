import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { certificateInclude } from './certificate-include.js';
import type { ListCertificatesQuery } from "./certificates.schema.js";
export const listCertificates = async (query: ListCertificatesQuery) => {
  const pagination = parsePagination(query);
  const where = {
    ...(query.studentId ? { studentId: query.studentId } : {}),
    ...(query.levelId ? { levelId: query.levelId } : {}),
    ...(query.status ? { status: query.status } : {}),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.certificate.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: certificateInclude,
    }),
    prisma.certificate.count({ where }),
  ]);
  return buildPaginated(rows, total, pagination);
};
