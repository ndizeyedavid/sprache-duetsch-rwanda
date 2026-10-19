import { importCourse } from "../html-course/importer.js";
import { A2_SPEC } from "./course.js";

/** Import A2 with stable ids and a backup; preview unless apply is true. */
export const importA2 = ({ apply }: { apply: boolean }) => importCourse(A2_SPEC, { apply });
