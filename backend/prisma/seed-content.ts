import { prisma } from "../src/lib/prisma.js";

const lessonTitles = [
  "Einführung",
  "Erste Schritte",
  "Werkzeuge & Aussprache",
  "Wortschatz im Alltag",
  "Grammatik Basis",
  "Übungen & Wiederholung",
];

const moduleTitles = ["Grundlagen", "Aufbau & Anwendung"];

export const seedContent = async (params: {
  levelIds: Map<string, string>;
  staffIds: Map<string, string>;
  levels: { code: string; title: string }[];
}) => {
  const { levelIds, staffIds, levels } = params;
  const uploaderId = staffIds.get("academic@sparch.rw") ?? null;

  for (const level of levels) {
    const levelId = levelIds.get(level.code)!;
    const imported = await prisma.module.count({
      where: { levelId, description: { contains: "Deutsch_A1_Kursbuch.pdf" } },
    });
    if (imported) continue;

    for (let m = 0; m < moduleTitles.length; m += 1) {
      const order = m + 1;
      const moduleRecord = await prisma.module.upsert({
        where: { levelId_order: { levelId, order } },
        update: {
          title: `${level.code} — ${moduleTitles[m]}`,
          description: `Modul ${order} für ${level.title}.`,
          isPublished: true,
        },
        create: {
          levelId,
          title: `${level.code} — ${moduleTitles[m]}`,
          description: `Modul ${order} für ${level.title}.`,
          order,
          isPublished: true,
        },
      });

      for (let l = 0; l < lessonTitles.length; l += 1) {
        const lessonOrder = l + 1;
        const lesson = await prisma.lesson.upsert({
          where: { moduleId_order: { moduleId: moduleRecord.id, order: lessonOrder } },
          update: {
            title: `${lessonTitles[l]}`,
            description: `Lektion ${lessonOrder} — ${lessonTitles[l]}.`,
            isPublished: true,
          },
          create: {
            moduleId: moduleRecord.id,
            title: `${lessonTitles[l]}`,
            description: `Lektion ${lessonOrder} — ${lessonTitles[l]}.`,
            order: lessonOrder,
            contentType: "MIXED",
            body: `Lernziele dieser Lektion: ${lessonTitles[l]}. Übe mit Audio und kurzen Aufgaben.`,
            estimatedMinutes: 15 + lessonOrder * 5,
            isPublished: true,
          },
        });

        if (l === 0) {
          await prisma.lessonMaterial.deleteMany({ where: { lessonId: lesson.id } });
          await prisma.lessonMaterial.createMany({
            data: [
              {
                lessonId: lesson.id,
                title: `${lessonTitles[l]} — Notizen (PDF)`,
                type: "PDF",
                url: "https://sparch.rw/materials/notes.pdf",
                mimeType: "application/pdf",
                sizeBytes: 512000,
                isDownloadable: true,
                uploadedById: uploaderId,
              },
              {
                lessonId: lesson.id,
                title: `${lessonTitles[l]} — Audio`,
                type: "AUDIO",
                url: "https://sparch.rw/materials/audio.mp3",
                mimeType: "audio/mpeg",
                sizeBytes: 1024000,
                isDownloadable: true,
                uploadedById: uploaderId,
              },
            ],
          });

          await prisma.activity.deleteMany({ where: { lessonId: lesson.id } });
          await prisma.activity.createMany({
            data: [
              {
                lessonId: lesson.id,
                title: "Vokabeln zuordnen",
                type: "MATCHING",
                instructions: "Verbinde das Wort mit der richtigen Übersetzung.",
                config: {
                  pairs: [
                    { left: "Hallo", right: "Muraho" },
                    { left: "Danke", right: "Murakoze" },
                  ],
                },
                order: 1,
                isPublished: true,
              },
              {
                lessonId: lesson.id,
                title: "Lückentext",
                type: "FILL_BLANK",
                instructions: "Ergänze die fehlenden Wörter.",
                config: { sentences: [{ text: "Ich ___ aus Ruanda.", answer: "komme" }] },
                order: 2,
                isPublished: true,
              },
            ],
          });
        }
      }
    }
  }
};

