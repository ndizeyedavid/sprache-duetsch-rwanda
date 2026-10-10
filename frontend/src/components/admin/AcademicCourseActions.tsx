import { useState } from "react";
import { FiEdit2,FiPlus,FiTrash2 } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { LevelItem } from "../../lib/services";
import { createLevel,listLevelModules,updateLevel } from "../../lib/services";
import { ErrorBlock,LoadingBlock } from "../common/PageState";
import { LevelDeleteDialog } from "../curriculum/LevelDeleteDialog";
import { LevelForm } from "../curriculum/LevelForm";
import { Modal } from "../ui/Modal";

type Props = { levels: LevelItem[]; onChanged: () => void };
export function AcademicCourseActions({ levels, onChanged }: Props) {
  const [params, setParams] = useSearchParams();
  const level =
    levels.find(
      (l) => l.id === params.get("level") || l.code === params.get("level"),
    ) ?? levels[0];
  const [dialog, setDialog] = useState<"create" | "edit" | "delete" | null>(
    null,
  );
  const [success, setSuccess] = useState<string | null>(null);
  const modules = useApi(
    `delete-level-lessons-${level?.id ?? "none"}`,
    () => listLevelModules(level.id),
    dialog === "delete" && Boolean(level),
  );
  function done(message: string) {
    setDialog(null);
    setSuccess(message);
    onChanged();
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          className="btn btn-sm rounded-full"
          onClick={() => setDialog("create")}
        >
          <FiPlus aria-hidden />
          New level
        </button>
        {level && (
          <>
            <button
              className="btn btn-sm rounded-full"
              onClick={() => setDialog("edit")}
            >
              <FiEdit2 aria-hidden />
              Edit {level.code}
            </button>
            <button
              className="btn btn-ghost btn-sm rounded-full text-error"
              onClick={() => setDialog("delete")}
            >
              <FiTrash2 aria-hidden />
              Delete level
            </button>
          </>
        )}
      </div>
      {success && (
        <p role="status" className="text-xs text-muted">
          {success}
        </p>
      )}
      <Modal
        open={dialog === "create"}
        onClose={() => setDialog(null)}
        title="New level"
      >
        <LevelForm
          submitLabel="Create level"
          onSubmit={createLevel}
          onDone={() => done("Level created.")}
          onCancel={() => setDialog(null)}
        />
      </Modal>
      {level && (
        <>
          <Modal
            open={dialog === "edit"}
            onClose={() => setDialog(null)}
            title={`Edit ${level.code}`}
          >
            <LevelForm
              key={level.id}
              initial={level}
              submitLabel="Save changes"
              onSubmit={(values) => updateLevel(level.id, values)}
              onDone={() => done("Level updated.")}
              onCancel={() => setDialog(null)}
            />
          </Modal>
          <Modal
            open={dialog === "delete"}
            onClose={() => setDialog(null)}
            title={`Delete ${level.code}?`}
          >
            {modules.loading ? (
              <LoadingBlock label="Checking lessons…" />
            ) : modules.error ? (
              <ErrorBlock message={modules.error} onRetry={modules.refetch} />
            ) : (
              <LevelDeleteDialog
                level={level}
                lessonCount={(modules.data ?? []).reduce(
                  (sum, m) => sum + m.lessons.length,
                  0,
                )}
                onCancel={() => setDialog(null)}
                onDeleted={() => {
                  setParams({});
                  done("Level deleted.");
                }}
              />
            )}
          </Modal>
        </>
      )}
    </div>
  );
}
