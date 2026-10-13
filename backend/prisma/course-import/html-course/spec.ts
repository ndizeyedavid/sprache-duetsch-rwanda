import { stableId } from "../stable-id.js";

/** Everything that differs between two HTML course imports. */
export type CourseSpec = {
  /** Level code the course is imported into (must exist in demo-demo-levels.ts). */
  level: string;
  /** `meta.niveau` expected in the course JSON, e.g. "B1" or "B2.1". */
  niveau: string;
  /** Stable-id namespace. Never change it: ids must survive re-imports. */
  namespace: string;
  /** Default HTML export, relative to the repository root. */
  html: string;
  /** Checked-in course manifest extracted from the HTML. */
  manifest: URL;
  /** Prefix for backups/<name>-*.json. */
  backupName: string;
  size: { modules: number; lessons: number; exercises: number; words: number; writingTasks: number };
};

export const courseIds = (spec: CourseSpec) => {
  const id = (key: string) => stableId(spec.namespace, key);
  return {
    id,
    module: (nr: number) => id(`module:${nr}`),
    lesson: (nr: number) => id(`lesson:${nr}`),
  };
};
