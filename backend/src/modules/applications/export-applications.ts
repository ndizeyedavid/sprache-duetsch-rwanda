// Spreadsheet of the admissions queue with the list's filters (every page, newest first). Applicants
// type these values themselves, so a cell a spreadsheet would run as a formula is neutralised.
import type { Response } from "express";
import { iso,sendCsv } from "../../lib/csv.js";
import { prisma } from "../../lib/prisma.js";
import { applicationListInclude } from "./application-select.js";
import type { ListApplicationsQuery } from "./applications.schema.js";
import { applicationWhere } from "./list-applications.js";

const PHONE = /^\+[\d\s()-]+$/;

export const safeCell = (value: string | null | undefined): string => {
  const text = value ?? "";
  return /^[=+\-@\t\r]/.test(text) && !PHONE.test(text) ? `'${text}` : text;
};

export async function exportApplications(res: Response, query: ListApplicationsQuery): Promise<void> {
  const rows = await prisma.application.findMany({
    where: { ...applicationWhere(query), ...(query.status ? { status: query.status } : {}) },
    orderBy: { createdAt: "desc" },
    include: applicationListInclude,
    take: 5000,
  });
  sendCsv(res, `applications-${new Date().toISOString().slice(0, 10)}.csv`, rows.map((row) => ({
    Reference: row.reference, Received: iso(row.createdAt), Status: row.status, Source: row.source,
    "First name": safeCell(row.firstName), "Last name": safeCell(row.lastName), Email: safeCell(row.email), Phone: safeCell(row.phone),
    Level: row.level?.code ?? "", Intake: row.intake?.name ?? "", Campus: row.campus?.name ?? "", Shift: row.shift ?? "",
    "German so far": safeCell(row.experience), Message: safeCell(row.message), "Student ID": row.student?.studentCode ?? "",
    "Decision note": safeCell(row.decisionReason), "Reviewed by": row.reviewedBy ? `${row.reviewedBy.firstName} ${row.reviewedBy.lastName}` : "",
  })));
}
