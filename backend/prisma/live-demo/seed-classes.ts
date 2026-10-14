import type { AttendanceStatus, SessionStatus } from "../../src/generated/prisma/client.js";
import { prisma } from "../../src/lib/prisma.js";
import { demoStudents } from "./accounts.js";
import type { DemoContext } from "./context.js";
import { daysFromNow } from "./context.js";

type Slot = { title: string; day: number; status: SessionStatus; note?: string };

const SLOTS: Record<"A1" | "B1", Slot[]> = {
  A1: [
    { title: "Begrüßung & Vorstellung", day: -21, status: "COMPLETED" },
    { title: "Zahlen, Uhrzeit & Datum", day: -14, status: "COMPLETED" },
    { title: "Familie & Freunde", day: -10, status: "CANCELLED", note: "Teacher ill — moved to next week" },
    { title: "Essen & Trinken im Café", day: -7, status: "COMPLETED" },
    { title: "Mein Tagesablauf", day: -3, status: "COMPLETED" },
    { title: "Wohnen in Kigali", day: 0, status: "LIVE" },
    { title: "Einkaufen auf dem Markt", day: 4, status: "SCHEDULED" },
    { title: "Wiederholung & Modultest", day: 11, status: "SCHEDULED" },
  ],
  B1: [
    { title: "Arbeitswelt: Bewerbungsgespräch", day: -12, status: "COMPLETED" },
    { title: "Nebensätze mit weil/obwohl", day: -5, status: "COMPLETED" },
    { title: "Diskussion: Stadt oder Land?", day: 2, status: "SCHEDULED" },
    { title: "Briefe schreiben (formell)", day: 9, status: "SCHEDULED" },
  ],
};

/** Sessions per demo class plus attendance that follows each student's attendance rate. */
export async function seedClasses(ctx: DemoContext) {
  for (const level of ["A1", "B1"] as const) {
    const classGroupId = ctx.classes.get(level)!;
    const teacherId = ctx.staff.get(level === "A1" ? "teacherA1" : "teacherB1")!;
    const hour = level === "A1" ? 18 : 9;
    const roster = demoStudents.filter((s) => s.level === level && (s.inClass || s.enrollment === "WITHDRAWN"));
    let pastIndex = 0;

    for (const slot of SLOTS[level]) {
      const startAt = daysFromNow(slot.day, hour);
      const session = await prisma.classSession.create({
        data: {
          classGroupId, teacherId, title: slot.title, mode: level === "A1" ? "ONLINE" : "HYBRID", provider: "GOOGLE_MEET",
          meetingUrl: `https://meet.google.com/demo-${level.toLowerCase()}-class`, startAt,
          endAt: new Date(startAt.getTime() + 90 * 60_000), timezone: "Africa/Kigali", status: slot.status,
          room: level === "B1" ? "Raum 1 · Kacyiru" : null, cancelReason: slot.status === "CANCELLED" ? slot.note : null,
          recordingUrl: slot.status === "COMPLETED" ? `https://drive.google.com/demo-recording-${level.toLowerCase()}` : null,
        },
      });
      if (slot.status !== "COMPLETED") continue;
      pastIndex += 1;
      for (const seed of roster) {
        const status = attendanceFor(seed.attendance, pastIndex);
        await prisma.attendance.create({
          data: { sessionId: session.id, studentId: ctx.students.get(seed.key)!.studentId, status, markedById: teacherId,
            note: status === "EXCUSED" ? "Doctor's appointment" : null },
        });
      }
    }
  }
}

/** Deterministic pattern: a 0.3 rate misses most classes, a 1.0 rate never misses. */
function attendanceFor(rate: number, index: number): AttendanceStatus {
  if (rate >= 1) return "PRESENT";
  const slot = (index * 37) % 10;
  if (slot < rate * 10) return index % 4 === 0 ? "LATE" : "PRESENT";
  return index % 3 === 0 ? "EXCUSED" : "ABSENT";
}
