import { useState } from 'react';
import { FiEdit2,FiGrid,FiTrash2 } from 'react-icons/fi';
import type { LevelItem } from '../../lib/services';
import { createLevel,updateLevel } from '../../lib/services';
import { Modal } from '../ui/Modal';
import { Panel } from '../ui/Panel';
import { LevelDeleteDialog } from './LevelDeleteDialog';
import { LevelForm } from './LevelForm';

type LevelPickerProps = {
  levels: LevelItem[];
  selectedLevel: LevelItem | null;
  onSelect: (levelId: string) => void;
  moduleCount: number;
  lessonCount: number;
  /** Admins can create, edit and delete levels; teachers only pick. */
  canManage: boolean;
  onLevelsChanged?: () => void;
  onLevelDeleted: (levelId: string) => void;
};

/** Level selector (Canvas course picker analogue) with admin create/edit/delete. */
export function LevelPicker({
  levels,
  selectedLevel,
  onSelect,
  moduleCount,
  lessonCount,
  canManage,
  onLevelsChanged,
  onLevelDeleted,
}: LevelPickerProps) {
  const [dialog, setDialog] = useState<'edit' | 'delete' | null>(null);
  const close = () => setDialog(null);

  return (
    <Panel>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-muted">
          <FiGrid aria-hidden /> Level
        </span>
        <div className="flex flex-wrap gap-2">
          {levels.length === 0 ? (
            <span className="text-xs text-muted">No levels assigned</span>
          ) : (
            levels.map((level) => (
              <button
                key={level.id}
                type="button"
                onClick={() => onSelect(level.id)}
                className={`btn btn-sm rounded-full ${selectedLevel?.id === level.id ? 'border-0 bg-brand text-white' : 'border-line bg-base-200'}`}
              >
                {level.code} · {level.levelLabel}
              </button>
            ))
          )}
        </div>
        {selectedLevel ? (
          <div className="ml-auto flex items-center gap-2 text-xs text-muted">
            <span className="hidden items-center gap-2 lg:flex">
              <span className="font-semibold text-ink">{selectedLevel.title}</span>
              <span>·</span>
              <span>{moduleCount} modules</span>
              <span>·</span>
              <span>{lessonCount} lessons</span>
            </span>
            {canManage ? (
              <>
                <button type="button" onClick={() => setDialog('edit')} className="btn btn-ghost btn-xs gap-1 rounded-full">
                  <FiEdit2 aria-hidden /> Edit
                </button>
                <button type="button" onClick={() => setDialog('delete')} className="btn btn-ghost btn-xs gap-1 rounded-full text-error">
                  <FiTrash2 aria-hidden /> Delete
                </button>
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {canManage ? (
        <details className="collapse collapse-arrow mt-3 rounded-box border border-line bg-base-200">
          <summary className="collapse-title py-3 text-xs font-semibold">Create a new level</summary>
          <div className="collapse-content pt-2">
            <LevelForm submitLabel="Create level" onSubmit={createLevel} onDone={() => onLevelsChanged?.()} />
          </div>
        </details>
      ) : null}

      {selectedLevel && canManage ? (
        <>
          <Modal open={dialog === 'edit'} onClose={close} title={`Edit ${selectedLevel.code}`}>
            <LevelForm
              key={selectedLevel.id}
              initial={selectedLevel}
              submitLabel="Save changes"
              onSubmit={(values) => updateLevel(selectedLevel.id, values)}
              onDone={() => {
                close();
                onLevelsChanged?.();
              }}
              onCancel={close}
            />
          </Modal>
          <Modal open={dialog === 'delete'} onClose={close} title={`Delete ${selectedLevel.code}?`}>
            <LevelDeleteDialog
              level={selectedLevel}
              lessonCount={lessonCount}
              onCancel={close}
              onDeleted={() => {
                close();
                onLevelDeleted(selectedLevel.id);
              }}
            />
          </Modal>
        </>
      ) : null}
    </Panel>
  );
}
