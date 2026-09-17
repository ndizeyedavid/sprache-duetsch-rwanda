import { useState } from "react";
import { apiErrorMessage } from "../../../lib/api";
import { getLesson } from "../../../lib/services";

export function useLessonCache() {
  const [cache, setCache] = useState<Record<string, Awaited<ReturnType<typeof getLesson>>>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function ensureLoaded(id: string, force = false) {
    if (!force && (cache[id] || loadingIds.has(id))) return;
    setLoadingIds((p) => new Set(p).add(id));
    setErrors((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
    try {
      const data = await getLesson(id);
      setCache((p) => ({ ...p, [id]: data }));
    } catch (err) {
      setErrors((p) => ({ ...p, [id]: apiErrorMessage(err, "Could not load this lesson.") }));
    } finally {
      setLoadingIds((p) => {
        const n = new Set(p);
        n.delete(id);
        return n;
      });
    }
  }

  function toggle(id: string) {
    if (expandedId === id) setExpandedId(null);
    else {
      setExpandedId(id);
      void ensureLoaded(id);
    }
  }

  function invalidate(id: string) {
    setCache((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
    void ensureLoaded(id, true);
  }

  function remove(id: string) {
    setCache((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
    if (expandedId === id) setExpandedId(null);
  }

  return { cache, loadingIds, errors, expandedId, setExpandedId, ensureLoaded, toggle, invalidate, remove };
}
