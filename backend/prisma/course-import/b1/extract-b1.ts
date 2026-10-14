// Extract the course JSON embedded in the B1 HTML export into b1-course.json.
// Usage (from backend/): npx tsx prisma/course-import/b1/extract-b1.ts [path/to/deutschsprache-b1.html]
import { extractCourse } from "../html-course/extract.js";
import { B1_SPEC } from "./course.js";

console.log(JSON.stringify(await extractCourse(B1_SPEC, process.argv[2])));
