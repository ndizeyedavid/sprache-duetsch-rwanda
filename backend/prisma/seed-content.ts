// Real curriculum for the seed: the A1 coursebook and the B1/B2.1 courses are imported from their
// checked-in manifests (idempotent, stable ids). Placeholder modules are no longer seeded.
import { importA1 } from "./course-import/a1-import.js";
import { importB1 } from "./course-import/b1/b1-import.js";
import { importB2 } from "./course-import/b2/b2-import.js";

export const seedContent = async () => {
  const a1 = await importA1({ apply: true });
  console.info(`  A1: ${a1.modules} modules, ${a1.units} units, ${a1.exercises} exercises`);
  // Creates the B1 level when missing (the demo seed later fills in classes and students).
  const b1 = await importB1({ apply: true });
  console.info(`  B1: ${b1.modules} modules, ${b1.lessons} lessons, ${b1.exercises} exercises, ${b1.flashcards} flashcards`);
  const b2 = await importB2({ apply: true });
  console.info(`  B2: ${b2.modules} modules, ${b2.lessons} lessons, ${b2.exercises} exercises, ${b2.flashcards} flashcards, ${b2.writingTasks} writing tasks`);
};
