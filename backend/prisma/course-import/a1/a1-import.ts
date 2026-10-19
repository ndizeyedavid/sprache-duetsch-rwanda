import { importCourse } from "../html-course/importer.js";
import { A1_SPEC } from "./course.js";

/** Import the A1 course with stable ids and a backup; preview unless apply is true. */
export const importA1Course = ({ apply }: { apply: boolean }) => importCourse(A1_SPEC, { apply });
