import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import type { ClassGroupItem } from "../../lib/services";
import { getClass } from "../../lib/services";
import { ErrorBlock,LoadingBlock } from "../common/PageState";
import { Modal } from "../ui/Modal";
import { ClassEditorForm } from "./ClassEditorForm";

type Props = {
  open: boolean;
  row: ClassGroupItem | null;
  onClose: () => void;
  onSaved: () => void;
};
export function ClassEditorDialog({ open, row, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const detail = useApi(
    `class-editor-${row?.id ?? "new"}`,
    () => getClass(row?.id ?? ""),
    open && row !== null,
  );
  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={saving}
      title={row ? "Edit class" : "New class"}
      boxClassName="max-w-2xl"
    >
      {row && (detail.loading || detail.stale) ? (
        <LoadingBlock label="Loading class…" />
      ) : row && detail.error ? (
        <ErrorBlock message={detail.error} onRetry={detail.refetch} />
      ) : (
        <ClassEditorForm
          key={row?.id ?? "new"}
          initial={row ? detail.data : null}
          onSaved={onSaved}
          onCancel={onClose}
          saving={saving}
          onSaving={setSaving}
        />
      )}
    </Modal>
  );
}
