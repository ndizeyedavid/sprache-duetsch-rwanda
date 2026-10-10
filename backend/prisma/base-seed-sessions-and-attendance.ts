import type {
AttendanceStatus
} from "../src/generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";
import { daysFromNow } from './base-days-from-now.js';
export const seedSessionsAndAttendance = async (params: {
  classIds: Map<string, string>;
  staffIds: Map<string, string>;
  studentIds: Map<string, string>;
}) => {
  const { classIds, staffIds, studentIds } = params;
  const a1ClassId = classIds.get("A1");
  if (!a1ClassId) return;

  await prisma.classSession.deleteMany({ where: { classGroupId: a1ClassId } });

  const teacherId = staffIds.get("clarisse@sparch.rw") ?? null;
  const a1Students = ["SDR-2024-0301"]
    .map((code) => studentIds.get(code))
    .filter((id): id is string => Boolean(id));

  const sessions = [
    {
      title: "Grammatik: Erste Schritte & Aussprache",
      startAt: daysFromNow(-7),
      endAt: daysFromNow(-7),
      status: "COMPLETED" as const,
      attendance: ["PRESENT"] as AttendanceStatus[],
    },
    {
      title: "Konversation: Begrüssung & Vorstellung",
      startAt: daysFromNow(0),
      endAt: daysFromNow(0),
      status: "SCHEDULED" as const,
      attendance: null,
    },
    {
      title: "Zahlen & Uhrzeit im Alltag",
      startAt: daysFromNow(3),
      endAt: daysFromNow(3),
      status: "SCHEDULED" as const,
      attendance: null,
    },
  ];

  for (const session of sessions) {
    const start = new Date(session.startAt);
    start.setHours(18, 0, 0, 0);
    const end = new Date(session.endAt);
    end.setHours(19, 30, 0, 0);

    const created = await prisma.classSession.create({
      data: {
        classGroupId: a1ClassId,
        teacherId,
        title: session.title,
        mode: "ONLINE",
        provider: "GOOGLE_MEET",
        meetingUrl: "https://meet.google.com/sparch-a1-demo",
        startAt: start,
        endAt: end,
        timezone: "Africa/Kigali",
        status: session.status,
      },
    });

    if (session.attendance) {
      for (let i = 0; i < a1Students.length; i += 1) {
        await prisma.attendance.create({
          data: {
            sessionId: created.id,
            studentId: a1Students[i],
            status: session.attendance[i] ?? "PRESENT",
            markedById: teacherId,
          },
        });
      }
    }
  }
};
