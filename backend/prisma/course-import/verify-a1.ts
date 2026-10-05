import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { prisma } from '../../src/lib/prisma.js';
import { isPracticeConfig } from '../../src/modules/content/practice.utils.js';

type Unit = { number: number; body: string; title: string; exercises: { key: string }[] };
const manifest = JSON.parse(await readFile(new URL('./a1-course.json', import.meta.url), 'utf8')) as { units: Unit[] };
try {
  const modules = await prisma.module.findMany({
    where: { level: { code: 'A1' }, isPublished: true }, orderBy: { order: 'asc' },
    include: { lessons: { where: { isPublished: true }, include: { activities: true } } },
  });
  assert.equal(modules.length, 10);
  const lessons = modules.flatMap(m => m.lessons).sort((a, b) => a.order - b.order);
  assert.equal(lessons.length, 50);
  let illustrations = 0;
  for (const [index, lesson] of lessons.entries()) {
    const unit = manifest.units[index];
    assert.equal(lesson.order, unit.number);
    assert.equal(lesson.body, unit.body, `Unit ${unit.number} content differs`);
    assert.equal(lesson.activities.length, unit.exercises.length + 1);
    for (const activity of lesson.activities) {
      assert.ok(isPracticeConfig(activity.config));
      if (activity.type === 'MCQ') {
        const cfg = activity.config as { options: string[]; correctIndex: number };
        assert.ok(cfg.correctIndex >= 0 && cfg.correctIndex < cfg.options.length);
      }
    }
    for (const match of unit.body.matchAll(/src="(\/coursebook\/a1\/[^"]+)"/g)) {
      await access(fileURLToPath(new URL(`../../../frontend/public${match[1]}`, import.meta.url)));
      illustrations++;
    }
  }
  const activities = lessons.flatMap(l => l.activities);
  const archived = await prisma.module.count({ where: { level: { code: 'A1' }, isPublished: false } });
  console.log(JSON.stringify({ modules: modules.length, units: lessons.length,
    activities: activities.length, multipleChoice: activities.filter(a => a.type === 'MCQ').length,
    structuredExercises: activities.filter(a => Array.isArray((a.config as { items?: unknown[] } | null)?.items)).length,
    writing: activities.filter(a => a.type === 'WRITING').length, illustrations, archived,
    contentMatchesManifest: true }));
} finally {
  await prisma.$disconnect();
}
