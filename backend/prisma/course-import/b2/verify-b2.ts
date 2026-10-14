// Check the imported B2 course in the configured database against b2-course.json.
// Usage (from backend/): npx tsx prisma/course-import/b2/verify-b2.ts
import { prisma } from "../../../src/lib/prisma.js";
import { verifyCourse } from "../html-course/verify.js";
import { B2_SPEC } from "./course.js";

try {
  console.log(JSON.stringify(await verifyCourse(B2_SPEC)));
} finally {
  await prisma.$disconnect();
}
