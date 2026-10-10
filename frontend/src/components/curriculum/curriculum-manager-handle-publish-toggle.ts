import { apiErrorMessage } from '../../lib/api';
import {
updateModule
} from '../../lib/services';
export function createHandlePublishToggle(context: { displayModules: import("../../lib/services").ModuleItem[]; setLocalModules: import("react").Dispatch<import("react").SetStateAction<import("../../lib/services").ModuleItem[] | null>>; setPublishingIds: import("react").Dispatch<import("react").SetStateAction<Set<string>>>; setError: import("react").Dispatch<import("react").SetStateAction<string | null>> }) {
const { displayModules, setLocalModules, setPublishingIds, setError } = context;
async function handlePublishToggle(mod: { id: string; isPublished?: boolean }) {
 const next = !(mod.isPublished ?? true);
 const previous = displayModules;
 setLocalModules((prev) =>
 prev ? prev.map((m) => (m.id === mod.id ? { ...m, isPublished: next } : m)) : prev,
 );
 setPublishingIds((prev) => new Set(prev).add(mod.id));
 setError(null);
 try {
 await updateModule(mod.id, { isPublished: next });
 } catch (err) {
 setLocalModules(previous ?? null);
 setError(apiErrorMessage(err, 'Could not update the module.'));
 } finally {
 setPublishingIds((prev) => {
 const nextSet = new Set(prev);
 nextSet.delete(mod.id);
 return nextSet;
 });
 }
 }
return handlePublishToggle;
}
