// Check the configured database against the A2 manifest, including every exercise answer.
import { prisma } from "../../../src/lib/prisma.js";
import { verifyCourse } from "../html-course/verify.js";
import { A2_SPEC } from "./course.js";

try {
  console.log(JSON.stringify(await verifyCourse(A2_SPEC)));
} finally {
  await prisma.$disconnect();
}
