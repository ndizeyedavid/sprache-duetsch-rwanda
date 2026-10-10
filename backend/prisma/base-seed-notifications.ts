import { prisma } from "../src/lib/prisma.js";
export const seedNotifications = async (params: { studentIds: Map<string, string> }) => {
  const { studentIds } = params;
  const nellaId = studentIds.get("SDR-2024-0301");
  if (!nellaId) return;

  const nellaUser = await prisma.student.findUnique({
    where: { id: nellaId },
    select: { userId: true },
  });
  if (!nellaUser) return;

  await prisma.notification.deleteMany({
    where: { userId: nellaUser.userId },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: nellaUser.userId,
        type: "SCHEDULE",
        channel: "IN_APP",
        title: "Live-Klasse heute 18:00",
        body: "Begrüssung & Vorstellung — Klicke zum Beitreten.",
        data: { link: "https://meet.google.com/sparch-a1-demo" },
      },
      {
        userId: nellaUser.userId,
        type: "PAYMENT",
        channel: "IN_APP",
        title: "Offener Betrag",
        body: "Dein Saldo beträgt 25.000 RWF. Teilzahlungen sind möglich.",
      },
    ],
  });
};
