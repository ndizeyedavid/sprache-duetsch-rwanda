import { apiErrorMessage } from '../../lib/api';
import {
updateLesson
} from '../../lib/services';
export function createHandleLessonDrop(context: { lessonDrag: { moduleId: string; lessonId: string; } | null; displayModules: import("../../lib/services").ModuleItem[]; setLocalModules: import("react").Dispatch<import("react").SetStateAction<import("../../lib/services").ModuleItem[] | null>>; setLessonDrag: import("react").Dispatch<import("react").SetStateAction<{ moduleId: string; lessonId: string; } | null>>; setLessonDragOver: import("react").Dispatch<import("react").SetStateAction<{ moduleId: string; lessonId: string; } | null>>; setLessonReorderingIds: import("react").Dispatch<import("react").SetStateAction<Set<string>>>; setError: import("react").Dispatch<import("react").SetStateAction<string | null>>; modules: import("../../hooks/useApi").ApiState<import("../../lib/services").ModuleItem[]> }) {
const { lessonDrag, displayModules, setLocalModules, setLessonDrag, setLessonDragOver, setLessonReorderingIds, setError, modules } = context;
async function handleLessonDrop(targetModuleId: string, targetLessonId: string) {
    if (!lessonDrag || lessonDrag.moduleId !== targetModuleId || lessonDrag.lessonId === targetLessonId) return;
    const mod = displayModules.find((m) => m.id === targetModuleId);
    if (!mod) return;
    const ordered = [...mod.lessons].sort((a, b) => a.order - b.order);
    const from = ordered.findIndex((l) => l.id === lessonDrag.lessonId);
    const to = ordered.findIndex((l) => l.id === targetLessonId);
    if (from === -1 || to === -1) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    const optimistic = ordered.map((l, index) => ({ ...l, order: index }));
    setLocalModules((prev) => (prev ? prev.map((m) => (m.id === targetModuleId ? { ...m, lessons: optimistic as never } : m)) : prev));
    setLessonDrag(null);
    setLessonDragOver(null);
    setLessonReorderingIds((prev) => new Set(prev).add(targetModuleId));
    setError(null);
    try {
      const TEMP = 1000;
      for (let i = 0; i < optimistic.length; i++) {
        await updateLesson(optimistic[i].id, { order: TEMP + i });
      }
      for (let i = 0; i < optimistic.length; i++) {
        await updateLesson(optimistic[i].id, { order: optimistic[i].order });
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not reorder lessons.'));
      setLocalModules(modules.data ? [...modules.data].sort((a, b) => a.order - b.order) : null);
    } finally {
      setLessonReorderingIds((prev) => {
        const next = new Set(prev);
        next.delete(targetModuleId);
        return next;
      });
      modules.refetch();
    }
  }
return handleLessonDrop;
}
