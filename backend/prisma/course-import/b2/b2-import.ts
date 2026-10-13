import { importCourse } from "../html-course/importer.js";
import { B2_SPEC } from "./course.js";

/** Import the B2 course into the B2 level. Dry-run unless `apply`; applying backs up first. */
export const importB2 = ({ apply }: { apply: boolean }) => importCourse(B2_SPEC, { apply });
