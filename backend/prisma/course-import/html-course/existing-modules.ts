// Decide what happens to a level's modules that the course import does not own.
export type ExistingModule = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  isPublished: boolean;
  hasStudentWork: boolean;
};
export type ModulePlan =
  | { id: string; title: string; action: "delete" | "keep" }
  | { id: string; title: string; action: "archive" | "move"; order: number };

/** Placeholder modules written by prisma/demo-seed-demo-content.ts for `level`. */
export function isPlaceholderModule(module: Pick<ExistingModule, "title" | "description">, level: string) {
  return /^Modul \d+ für /.test(module.description ?? "")
    || module.title === `${level} — Grundlagen` || module.title === `${level} — Aufbau & Anwendung`;
}

/**
 * Placeholders without student work are deleted; with work they are unpublished and moved
 * below zero (history kept). Other staff-made modules stay published and only move if their
 * position collides with the imported modules 1..courseSize.
 */
export function planExistingModules(
  level: string, existing: ExistingModule[], importIds: Set<string>, courseSize: number,
): ModulePlan[] {
  const others = existing.filter((m) => !importIds.has(m.id));
  let archiveOrder = Math.min(-999, ...existing.map((m) => m.order));
  let moveOrder = Math.max(courseSize, ...existing.map((m) => m.order));
  return others.map((m): ModulePlan => {
    if (isPlaceholderModule(m, level)) {
      if (!m.hasStudentWork) return { id: m.id, title: m.title, action: "delete" };
      return { id: m.id, title: m.title, action: "archive", order: m.order < 0 ? m.order : (archiveOrder -= 1) };
    }
    if (m.order >= 1 && m.order <= courseSize) return { id: m.id, title: m.title, action: "move", order: (moveOrder += 1) };
    return { id: m.id, title: m.title, action: "keep" };
  });
}
