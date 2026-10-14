// Check the imported B1 course in the configured database against b1-course.json.
// Usage (from backend/): npx tsx prisma/course-import/b1/verify-b1.ts
import { prisma } from "../../../src/lib/prisma.js";
import { verifyCourse } from "../html-course/verify.js";
import { B1_SPEC } from "./course.js";

try {
  console.log(JSON.stringify(await verifyCourse(B1_SPEC)));
} finally {
  await prisma.$disconnect();
}
