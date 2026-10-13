import { importCourse } from "../html-course/importer.js";
import { B1_SPEC } from "./course.js";

/** Import the B1 course into the B1 level. Dry-run unless `apply`; applying backs up first. */
export const importB1 = ({ apply }: { apply: boolean }) => importCourse(B1_SPEC, { apply });
