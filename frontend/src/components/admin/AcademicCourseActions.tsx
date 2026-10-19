import { useState } from "react";
import { FiEdit2,FiPlus,FiTrash2 } from "react-icons/fi";
import { useSearchParams } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import type { LevelItem } from "../../lib/services";
import { createLevel,listLevelModules,updateLevel } from "../../lib/services";
import { ErrorBlock,LoadingBlock } from "../common/PageState";
import { heroAction,heroGhost } from "../hero/hero-actions";
import { LevelDeleteDialog } from "../curriculum/LevelDeleteDialog";
import { LevelForm } from "../curriculum/LevelForm";
import { Modal } from "../ui/Modal";

type Props = { levels: LevelItem[]; onChanged: () => void; /** Catalogue view: only "New level" (edit/delete live in each course's studio). */ createOnly?: boolean };
/** Level admin actions (create, edit, delete) as white pills for the Course studio hero, plus their dialogs. */
export function AcademicCourseActions({ levels, onChanged, createOnly = false }: Props) {
  const [params, setParams] = useSearchParams();
  const level = createOnly ? undefined :
    levels.find(
      (l) => l.id === params.get("level") || l.code === params.get("level"),
    ) ?? levels[0];
  const [dialog, setDialog] = useState<"create" | "edit" | "delete" | null>(
    null,
  );
  const [success, setSuccess] = useState<string | null>(null);
  const modules = useApi(
    `delete-level-lessons-${level?.id ?? "none"}`,
    () => listLevelModules(level?.id ?? ""),
    dialog === "delete" && Boolean(level),
  );
  function done(message: string) {
    setDialog(null);
    setSuccess(message);
    onChanged();
  }
  return (
    <>
      <button type="button" className={heroAction} onClick={() => setDialog("create")}>
        <FiPlus aria-hidden />
        New level
      </button>
      {level && (
        <>
          <button type="button" className={heroGhost} onClick={() => setDialog("edit")}>
            <FiEdit2 aria-hidden />
            Edit {level.code}
          </button>
          <button type="button" className={heroGhost} onClick={() => setDialog("delete")}>
            <FiTrash2 aria-hidden />
            Delete level
          </button>
        </>
      )}
      {success && (
        <span role="status" className="hero-chip hero-chip-solid">
          {success}
        </span>
      )}
      {/* Dialogs inherit text colour; reset it so they read normally when mounted inside the red hero. */}
      <div className="contents text-base-content">
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
    </>
  );
}
