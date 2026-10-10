import { apiErrorMessage } from '../../lib/api';
import {
getLesson
} from '../../lib/services';
export function createEnsureLessonLoaded(context: { lessonCache: Record<string, import("../../lib/services").AuthoredLesson>; lessonLoadingIds: Set<string>; setLessonLoadingIds: import("react").Dispatch<import("react").SetStateAction<Set<string>>>; setLessonErrors: import("react").Dispatch<import("react").SetStateAction<Record<string, string>>>; setLessonCache: import("react").Dispatch<import("react").SetStateAction<Record<string, import("../../lib/services").AuthoredLesson>>> }) {
const { lessonCache, lessonLoadingIds, setLessonLoadingIds, setLessonErrors, setLessonCache } = context;
async function ensureLessonLoaded(id: string, force = false) {
 if (!force && (lessonCache[id] || lessonLoadingIds.has(id))) return;
 setLessonLoadingIds((prev) => new Set(prev).add(id));
 setLessonErrors((prev) => {
 const next = { ...prev };
 delete next[id];
 return next;
 });
 try {
 const data = await getLesson(id);
 setLessonCache((prev) => ({ ...prev, [id]: data }));
 } catch (err) {
 setLessonErrors((prev) => ({ ...prev, [id]: apiErrorMessage(err, 'Could not load this lesson.') }));
 } finally {
 setLessonLoadingIds((prev) => {
 const next = new Set(prev);
 next.delete(id);
 return next;
 });
 }
 }
return ensureLessonLoaded;
}
