import { apiErrorMessage } from "../../lib/api";
import {
gradeAttempt
} from "../../lib/services";
export function createDoSave(context: { passed: boolean | undefined; selectedId: string | null; detail: import("../../hooks/useApi").ApiState<import("../../lib/services").StaffAttempt>; setSaving: import("react").Dispatch<import("react").SetStateAction<boolean>>; setSaveError: import("react").Dispatch<import("react").SetStateAction<string | null>>; points: Record<string, string>; feedback: Record<string, string>; overall: string; setSaved: import("react").Dispatch<import("react").SetStateAction<boolean>>; attempts: import("../../hooks/useApi").ApiState<{ id: string; status: string; attemptNumber: number; score: number | null; maxScore: import("../../lib/services").Money; passed: boolean | null; submittedAt: string | null; student: { studentCode: string; user: { firstName: string; lastName: string; }; }; assessment: { id: string; title: string; }; }[]>; setSelectedId: import("react").Dispatch<import("react").SetStateAction<string | null>> }) {
const { passed, selectedId, detail, setSaving, setSaveError, points, feedback, overall, setSaved, attempts, setSelectedId } = context;
async function doSave(nextId?: string | null) {
 if (!selectedId || !detail.data) return;
 setSaving(true);
 setSaveError(null);
 try {
 await gradeAttempt(selectedId, {
 answers: (detail.data.answers ?? []).map((a) => ({
 answerId: a.id,
 pointsAwarded: Number(points[a.id] ?? a.pointsAwarded),
 feedback: feedback[a.id]?.trim() || undefined,
 })),
 feedback: overall.trim() || undefined,
 passed,
 });
 setSaved(true);
 attempts.refetch();
 detail.refetch();
 if (nextId !== undefined) setSelectedId(nextId);
 } catch (err) {
 setSaveError(apiErrorMessage(err, "Could not save."));
 } finally {
 setSaving(false);
 }
 }
return doSave;
}
