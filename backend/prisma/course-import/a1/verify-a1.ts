// Check the configured database against the A1 course manifest, including every exercise answer.
import { prisma } from "../../../src/lib/prisma.js";
import { verifyCourse } from "../html-course/verify.js";
import { A1_SPEC } from "./course.js";

try {
  console.log(JSON.stringify(await verifyCourse(A1_SPEC)));
} finally {
  await prisma.$disconnect();
}
