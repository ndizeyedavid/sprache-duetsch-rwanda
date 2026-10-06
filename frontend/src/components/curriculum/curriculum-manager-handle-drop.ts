import { apiErrorMessage } from '../../lib/api';
import {
updateModule
} from '../../lib/services';
export function createHandleDrop(context: { dragId: string | null; selectedLevelId: string | null; displayModules: import("../../lib/services").ModuleItem[]; setLocalModules: import("react").Dispatch<import("react").SetStateAction<import("../../lib/services").ModuleItem[] | null>>; setDragId: import("react").Dispatch<import("react").SetStateAction<string | null>>; setDragOverId: import("react").Dispatch<import("react").SetStateAction<string | null>>; setReordering: import("react").Dispatch<import("react").SetStateAction<boolean>>; setError: import("react").Dispatch<import("react").SetStateAction<string | null>>; modules: import("../../hooks/useApi").ApiState<import("../../lib/services").ModuleItem[]> }) {
const { dragId, selectedLevelId, displayModules, setLocalModules, setDragId, setDragOverId, setReordering, setError, modules } = context;
async function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId || !selectedLevelId) return;
    const ordered = [...displayModules].sort((a, b) => a.order - b.order);
    const from = ordered.findIndex((m) => m.id === dragId);
    const to = ordered.findIndex((m) => m.id === targetId);
    if (from === -1 || to === -1) return;
    const [moved] = ordered.splice(from, 1);
    ordered.splice(to, 0, moved);
    const optimistic = ordered.map((m, index) => ({ ...m, order: index }));
    setLocalModules(optimistic);
    setDragId(null);
    setDragOverId(null);
    setReordering(true);
    setError(null);
    try {
      // Avoid unique [levelId, order] collisions — bump to temp offset first, then to final order
      const TEMP = 1000;
      for (let i = 0; i < optimistic.length; i++) {
        await updateModule(optimistic[i].id, { order: TEMP + i });
      }
      for (let i = 0; i < optimistic.length; i++) {
        await updateModule(optimistic[i].id, { order: optimistic[i].order });
      }
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not reorder modules.'));
      setLocalModules(modules.data ? [...modules.data].sort((a, b) => a.order - b.order) : null);
    } finally {
      setReordering(false);
      modules.refetch();
    }
  }
return handleDrop;
}
