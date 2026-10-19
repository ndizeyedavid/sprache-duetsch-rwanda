// Preview by default. Apply with: node --import tsx prisma/live-demo/quick-test.ts --apply
import { prisma } from "../../src/lib/prisma.js";
import { quickTestAccounts } from "./quick-test-accounts.js";
import { seedQuickTest } from "./seed-quick-test.js";

try {
  const apply = process.argv.includes("--apply");
  console.info(JSON.stringify(apply ? await seedQuickTest() : { mode: "dry-run", accounts: quickTestAccounts }, null, 2));
} finally {
  await prisma.$disconnect();
}
