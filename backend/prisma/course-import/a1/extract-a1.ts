// Usage (from backend/): npx tsx prisma/course-import/a1/extract-a1.ts [path/to/deutschsprache-a1.html]
import { extractCourse } from "../html-course/extract.js";
import { A1_SPEC } from "./course.js";

console.log(JSON.stringify(await extractCourse(A1_SPEC, process.argv[2])));
