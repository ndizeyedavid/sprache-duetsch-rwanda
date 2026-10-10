import { prisma } from "../src/lib/prisma.js";
import { demoLevels } from './demo-demo-levels.js';
import { lessonTitles } from './demo-lesson-titles.js';
import { moduleTitles } from './demo-module-titles.js';
export const seedDemoContent = async (params: { levelIds: Map<string, string> }) => {
  const { levelIds } = params;
  const uploader = await prisma.user.findUnique({
    where: { email: "academic@sparch.rw" },
    select: { id: true },
  });
  const uploaderId = uploader?.id ?? null;

  for (const level of demoLevels) {
    const levelId = levelIds.get(level.code)!;

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
        }
      }
    }
  }
};
