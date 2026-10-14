// Public demo dataset for the hosted site (/demo lists the logins). Safe to re-run: it first removes
// only demo records (@demo.sparch.rw users, DEMO- codes) and never writes levels, modules, lessons or activities.
// Run: LIVE_DEMO_CONFIRM=yes DATABASE_URL=... node --import tsx prisma/live-demo/run.ts [--reset-only]
import { prisma } from "../../src/lib/prisma.js";
import { loadContext } from "./context.js";
import { resetDemo } from "./reset.js";
import { seedClasses } from "./seed-classes.js";
import { seedEngagement } from "./seed-engagement.js";
import { seedFinance } from "./seed-finance.js";
import { seedCertificate, seedHomework, seedProgress } from "./seed-learning.js";
import { seedPeople } from "./seed-people.js";
import { seedQuiz } from "./seed-quiz.js";

if (process.env.LIVE_DEMO_CONFIRM !== "yes") throw new Error("Set LIVE_DEMO_CONFIRM=yes to write demo data");

const curriculum = async () => ({ modules: await prisma.module.count(), lessons: await prisma.lesson.count(), activities: await prisma.activity.count() });

try {
  const before = await curriculum();
  console.info("Removed previous demo data:", await resetDemo());
  if (!process.argv.includes("--reset-only")) {
    const ctx = await loadContext();
    const steps: [string, (c: typeof ctx) => Promise<void>][] = [
      ["people + classes", seedPeople], ["finance", seedFinance], ["sessions + attendance", seedClasses],
      ["lesson progress", seedProgress], ["quiz", seedQuiz], ["homework", seedHomework],
      ["certificate", seedCertificate], ["admissions, messages, notifications", seedEngagement],
    ];
    for (const [label, step] of steps) {
      await step(ctx);
      console.info(`✔ ${label}`);
    }
  }
  const after = await curriculum();
  if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error(`Curriculum changed: ${JSON.stringify({ before, after })}`);
  console.info("Curriculum untouched:", after);
} finally {
  await prisma.$disconnect();
}
