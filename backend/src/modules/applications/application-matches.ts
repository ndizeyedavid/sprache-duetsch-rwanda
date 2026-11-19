// Who else an applicant may already be (match-rules.ts): their other applications, and student records
// with the same email, phone or name. The website creates an account per applicant email ("own"), so a
// student who applies again with a new email shows up here instead of quietly becoming a second student.
import type { ApplicationStatus } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { MatchVia,Person } from "./match-rules.js";
import { emailKey,matchReasons } from "./match-rules.js";

export type ApplicationMatches = {
  applications: { id: string; reference: string; status: ApplicationStatus; createdAt: Date; via: MatchVia[] }[];
  students: {
    id: string; studentCode: string; name: string; email: string; status: string; own: boolean; via: MatchVia[];
    lastLoginAt: Date | null; enrollments: { level: string; intake: string; status: string }[];
  }[];
};

/** Matches for each given application, keyed by application id. */
export async function findMatches(apps: (Person & { id: string })[]): Promise<Map<string, ApplicationMatches>> {
  const result = new Map<string, ApplicationMatches>();
  if (!apps.length) return result;
  const [applications, students] = await Promise.all([
    prisma.application.findMany({ select: { id: true, reference: true, status: true, createdAt: true, firstName: true, lastName: true, email: true, phone: true } }),
    prisma.student.findMany({
      select: {
        id: true, studentCode: true, status: true,
        user: { select: { firstName: true, lastName: true, email: true, phone: true, lastLoginAt: true } },
        enrollments: { orderBy: { enrolledAt: "desc" }, select: { status: true, level: { select: { code: true } }, intake: { select: { name: true } } } },
      },
    }),
  ]);
  for (const app of apps) {
    const own = emailKey(app.email);
    result.set(app.id, {
      applications: applications.filter((other) => other.id !== app.id).flatMap((other) => {
        const via = matchReasons(app, other);
        return via.length ? [{ id: other.id, reference: other.reference, status: other.status, createdAt: other.createdAt, via }] : [];
      }),
      students: students.flatMap((student) => {
        const via = matchReasons(app, student.user);
        if (!via.length) return [];
        return [{
          id: student.id, studentCode: student.studentCode, name: `${student.user.firstName} ${student.user.lastName}`.trim(), email: student.user.email,
          status: student.status, own: emailKey(student.user.email) === own, via, lastLoginAt: student.user.lastLoginAt,
          enrollments: student.enrollments.map((row) => ({ level: row.level.code, intake: row.intake.name, status: row.status })),
        }];
      }),
    });
  }
  return result;
}
