// Usage (from backend/): npx tsx prisma/course-import/a2/extract-a2.ts [path/to/deutschsprache-a2.html]
import { extractCourse } from "../html-course/extract.js";
import { A2_SPEC } from "./course.js";

console.log(JSON.stringify(await extractCourse(A2_SPEC, process.argv[2])));
