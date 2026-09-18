import type { AssignmentItem } from "../../lib/services";

export function bucketOf(a: AssignmentItem, now = new Date()): string {
  if (a.status === "GRADED" || a.status === "SUBMITTED") return "Done";
  if (a.status === "MISSING") return "Missing";
  if (!a.dueAt) return "Undated";
  const due = new Date(a.dueAt);
  if (Number.isNaN(due.getTime())) return "Undated";
  if (due < now) return "Overdue";
  return "Upcoming";
}

export function groupByBucket(items: AssignmentItem[]) {
  const order = ["Overdue", "Missing", "Upcoming", "Undated", "Done"];
  const seen = new Set<string>();
  const map = new Map<string, AssignmentItem[]>();
  for (const a of items) {
    if (seen.has(a.id)) continue;
    seen.add(a.id);
    const b = bucketOf(a);
    const arr = map.get(b) ?? [];
    arr.push(a);
    map.set(b, arr);
  }
  return order.filter((k) => map.has(k)).map((k) => ({ label: k, items: map.get(k)! }));
}

export function groupByCourse(items: AssignmentItem[]) {
  const map = new Map<string, { code: string; title: string; items: AssignmentItem[] }>();
  for (const a of items) {
    const key = a.levelCode;
    const entry = map.get(key) ?? { code: a.levelCode, title: a.levelTitle, items: [] };
    entry.items.push(a);
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => a.code.localeCompare(b.code));
}

export function humanType(t: string): string {
  return t.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
