// Real curriculum for the seed: A1, A2, B1 and B2.1 are imported from their
// checked-in manifests (idempotent, stable ids). Placeholder modules are no longer seeded.
// A1 is the "Deutsch A1 — Kursprogramm" course; the older PDF coursebook import
// (course-import/a1-import.ts) is retired and is no longer run by the seed.
import { importA1Course } from "./course-import/a1/a1-import.js";
import { importA2 } from "./course-import/a2/a2-import.js";
import { importB1 } from "./course-import/b1/b1-import.js";
import { importB2 } from "./course-import/b2/b2-import.js";

export const seedContent = async () => {
  const a1 = await importA1Course({ apply: true });
  console.info(`  A1: ${a1.modules} modules, ${a1.lessons} lessons, ${a1.exercises} exercises, ${a1.flashcards} flashcards`);
  const a2 = await importA2({ apply: true });
  console.info(`  A2: ${a2.modules} modules, ${a2.lessons} lessons, ${a2.exercises} exercises, ${a2.flashcards} flashcards`);
  // Creates the B1 level when missing (the demo seed later fills in classes and students).
  const b1 = await importB1({ apply: true });
  console.info(`  B1: ${b1.modules} modules, ${b1.lessons} lessons, ${b1.exercises} exercises, ${b1.flashcards} flashcards`);
  const b2 = await importB2({ apply: true });
  console.info(`  B2: ${b2.modules} modules, ${b2.lessons} lessons, ${b2.exercises} exercises, ${b2.flashcards} flashcards, ${b2.writingTasks} writing tasks`);
};
