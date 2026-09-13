import { useState } from 'react';
import type { FormEvent } from 'react';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { rwf } from '../../lib/format';
import {
  createLevel,
  createModule,
  listLevelModules,
  listLevels,
  money,
} from '../../lib/services';

export function AdminCourses() {
  const levels = useApi('admin-levels', listLevels);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [levelLabel, setLevelLabel] = useState('');
  const [fee, setFee] = useState('');
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleOrder, setModuleOrder] = useState('0');

  const modules = useApi(
    `level-modules-${selectedLevelId ?? 'none'}`,
    () => listLevelModules(selectedLevelId ?? ''),
  );

  async function handleCreateLevel(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSaving(true);
    try {
      await createLevel({
        code: code.trim().toUpperCase(),
        title: title.trim(),
        levelLabel: levelLabel.trim(),
        defaultFee: fee ? Number(fee) : 0,
      });
      setCode('');
      setTitle('');
      setLevelLabel('');
      setFee('');
      levels.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not create the level.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateModule(event: FormEvent) {
    event.preventDefault();
    if (!selectedLevelId) return;
    setFormError(null);
    setSaving(true);
    try {
      await createModule(selectedLevelId, {
        title: moduleTitle.trim(),
        order: Number(moduleOrder),
        isPublished: true,
      });
      setModuleTitle('');
      modules.refetch();
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not create the module.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel>
        <SectionHeader title="Levels" />
        {levels.loading ? (
          <LoadingBlock label="Loading levels…" />
        ) : levels.error || !levels.data ? (
          <ErrorBlock message={levels.error ?? 'Could not load levels.'} onRetry={levels.refetch} />
        ) : (
          <ul className="space-y-2">
            {levels.data.map((level) => (
              <li key={level.id}>
                <button
                  type="button"
                  onClick={() => setSelectedLevelId(level.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-field p-3 text-left transition-colors ${
                    selectedLevelId === level.id ? 'bg-brand-tint' : 'bg-base-200 hover:bg-brand-tint/60'
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">
                      {level.code} · {level.title}
                    </span>
                    <span className="block text-[11px] text-muted">
                      {rwf(money(level.defaultFee))} {level.currency}
                    </span>
                  </span>
                  <StatusBadge status={level.isActive ? 'Active' : 'Inactive'} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <h2 className="mt-6 text-sm font-semibold">New level</h2>
        <form onSubmit={handleCreateLevel} className="mt-2 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input required value={code} onChange={(event) => setCode(event.target.value)} placeholder="Code (A1)" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <input required value={levelLabel} onChange={(event) => setLevelLabel(event.target.value)} placeholder="Label (Beginner)" className="input input-sm w-full rounded-field border-line bg-base-200" />
          </div>
          <input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" className="input input-sm w-full rounded-field border-line bg-base-200" />
          <input value={fee} onChange={(event) => setFee(event.target.value)} inputMode="numeric" placeholder="Default fee (RWF)" className="input input-sm w-full rounded-field border-line bg-base-200" />
          {formError ? (
            <p role="alert" className="text-xs font-medium text-error">
              {formError}
            </p>
          ) : null}
          <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
            Create level
          </button>
        </form>
      </Panel>

      <Panel>
        <SectionHeader title="Modules" />
        {!selectedLevelId ? (
          <EmptyBlock title="Select a level" hint="Choose a level on the left to manage its modules." />
        ) : modules.loading ? (
          <LoadingBlock label="Loading modules…" />
        ) : modules.error ? (
          <ErrorBlock message={modules.error} onRetry={modules.refetch} />
        ) : !modules.data || modules.data.length === 0 ? (
          <EmptyBlock title="No modules yet" hint="Create the first module below." />
        ) : (
          <ul className="space-y-2">
            {modules.data.map((module) => (
              <li key={module.id} className="flex items-center justify-between gap-3 rounded-field bg-base-200 px-3 py-2 text-xs">
                <span className="truncate font-medium">{module.title}</span>
                <span className="shrink-0 text-muted">Order {module.order}</span>
              </li>
            ))}
          </ul>
        )}

        {selectedLevelId ? (
          <form onSubmit={handleCreateModule} className="mt-4 space-y-3">
            <h2 className="text-sm font-semibold">New module</h2>
            <input required value={moduleTitle} onChange={(event) => setModuleTitle(event.target.value)} placeholder="Module title" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <input value={moduleOrder} onChange={(event) => setModuleOrder(event.target.value)} inputMode="numeric" placeholder="Order" className="input input-sm w-full rounded-field border-line bg-base-200" />
            <button type="submit" disabled={saving} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
              Create module
            </button>
          </form>
        ) : null}
      </Panel>
    </div>
  );
}
