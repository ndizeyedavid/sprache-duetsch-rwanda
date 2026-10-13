// Extract the course JSON embedded in the B2 HTML export into b2-course.json.
// Usage (from backend/): npx tsx prisma/course-import/b2/extract-b2.ts [path/to/deutschsprache-b2-1.html]
import { extractCourse } from "../html-course/extract.js";
import { B2_SPEC } from "./course.js";

console.log(JSON.stringify(await extractCourse(B2_SPEC, process.argv[2])));
