export function createToggleLesson(context: { expandedLessonId: string | null; searchParams: URLSearchParams; setSearchParams: import("../../../node_modules/react-router-dom/dist/index").SetURLSearchParams; displayModules: import("../../lib/services").ModuleItem[]; setCollapsed: import("react").Dispatch<import("react").SetStateAction<Record<string, boolean>>>; selectedLevelId: string }) {
const { expandedLessonId, searchParams, setSearchParams, displayModules, setCollapsed, selectedLevelId } = context;
function toggleLesson(id: string) {
 if (expandedLessonId === id) {
 const next = new URLSearchParams(searchParams);
 next.delete('lesson');
 // keep ?module so user stays in the module, keep ?level
 setSearchParams(next);
 } else {
 const next = new URLSearchParams(searchParams);
 next.set('lesson', id);
 const parent = displayModules.find((m) => m.lessons.some((l) => l.id === id));
 if (parent) {
 next.set('module', parent.id);
 // ensure module is expanded
 setCollapsed((prev) => {
 if (!prev[parent.id]) return prev;
 const nextCollapsed = { ...prev };
 delete nextCollapsed[parent.id];
 return nextCollapsed;
 });
 }
 if (selectedLevelId) next.set('level', selectedLevelId);
 setSearchParams(next);
 }
 }
return toggleLesson;
}
