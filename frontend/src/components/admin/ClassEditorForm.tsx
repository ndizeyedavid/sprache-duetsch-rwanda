import type { FormEvent } from "react";
import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { apiErrorMessage } from "../../lib/api";
import type { ClassGroupDetail } from "../../lib/services";
import {
createClass,
listCampusesFull,
listIntakesFull,
listLevels,
updateClass,
} from "../../lib/services";
import { listTeachingAssignments } from "../../lib/teaching";
import { ErrorBlock,LoadingBlock } from "../common/PageState";
import { ClassEditorFields } from "./ClassEditorFields";
import type { ClassDraft } from "./class-draft";

type Props = {
  initial: ClassGroupDetail | null;
  onSaved: () => void;
  onCancel: () => void;
  saving: boolean;
  onSaving: (value: boolean) => void;
};
export function ClassEditorForm({
  initial,
  onSaved,
  onCancel,
  saving,
  onSaving,
}: Props) {
  const levels = useApi("class-editor-levels", listLevels);
  const intakes = useApi("class-editor-intakes", listIntakesFull);
  const campuses = useApi("class-editor-campuses", listCampusesFull);
  const teachers = useApi("class-editor-teachers", listTeachingAssignments);
  const [draft, setDraft] = useState<ClassDraft>({
    code: initial?.code ?? "",
    name: initial?.name ?? "",
    levelId: initial?.levelId ?? "",
    intakeId: initial?.intakeId ?? "",
    campusId: initial?.campusId ?? "",
    teacherId: initial?.teacherId ?? "",
    shift: initial?.shift ?? "EVENING",
    capacity: String(initial?.capacity ?? 30),
    room: initial?.room ?? "",
    isActive: initial?.isActive ?? true,
  });
  const [error, setError] = useState<string | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    onSaving(true);
    try {
      const body = {
        ...draft,
        code: draft.code.trim().toUpperCase(),
        name: draft.name.trim(),
        capacity: Number(draft.capacity),
        teacherId: draft.teacherId || null,
        room: draft.room.trim() || null,
      };
      if (initial) await updateClass(initial.id, body);
      else await createClass(body);
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not save the class."));
    } finally {
      onSaving(false);
    }
  }
  const lookupError =
    levels.error || intakes.error || campuses.error || teachers.error;
  if (levels.loading || intakes.loading || campuses.loading || teachers.loading)
    return <LoadingBlock label="Loading class options…" />;
  if (lookupError)
    return (
      <ErrorBlock
        message={lookupError}
        onRetry={() => {
          levels.refetch();
          intakes.refetch();
          campuses.refetch();
          teachers.refetch();
        }}
      />
    );
  return (
    <form onSubmit={submit} className="space-y-4">
      <fieldset disabled={saving}>
        <ClassEditorFields
          draft={draft}
          onChange={(patch) =>
            setDraft((current) => ({ ...current, ...patch }))
          }
          levels={levels.data ?? []}
          intakes={intakes.data ?? []}
          campuses={campuses.data ?? []}
          teachers={teachers.data ?? []}
        />
      </fieldset>
      {error && (
        <p role="alert" className="text-xs text-error">
          {error}
        </p>
      )}
      <div className="modal-action">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="btn btn-sm rounded-full"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary btn-sm rounded-full"
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Create class"}
        </button>
      </div>
    </form>
  );
}
