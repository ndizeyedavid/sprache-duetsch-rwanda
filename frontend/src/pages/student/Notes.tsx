import { useMemo,useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { NoteModuleCard } from '../../components/notes/NoteModuleCard';
import { NotesHero } from '../../components/notes/NotesHero';
import { NotesToolbar } from '../../components/notes/NotesToolbar';
import { filterNotes,groupNotes } from '../../components/notes/notes-utils';
import { useApi } from '../../hooks/useApi';
import { listLevels } from '../../lib/services/list-levels';
import { listMyNotes } from '../../lib/student-notes';

/** Every note, PDF, worksheet and slide deck for the student's level, searchable in one place. */
export function Notes() {
  const notes = useApi('my-notes', listMyNotes);
  const levels = useApi('levels', listLevels);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const levelCodes = useMemo(() => new Map((levels.data ?? []).map(level => [level.id, level.code])), [levels.data]);
  const available = useMemo(() => new Set((notes.data ?? []).map(note => note.type)), [notes.data]);
  const visible = useMemo(() => filterNotes(notes.data ?? [], query, type), [notes.data, query, type]);
  const groups = useMemo(() => groupNotes(visible), [visible]);

  if (notes.loading) return <div className="space-y-4"><NotesHero /><LoadingBlock label="Loading your notes…" /></div>;
  if (notes.error || !notes.data) {
    return (
      <div className="space-y-4">
        <NotesHero />
        <ErrorBlock message={notes.error ?? 'Could not load your notes.'} onRetry={notes.refetch} />
        <p className="text-sm text-muted">If your course is locked for payment, see <Link to="/payments" className="font-medium text-brand hover:underline">Payments</Link>.</p>
      </div>
    );
  }

  const total = notes.data.length;
  if (total === 0) {
    return <div className="space-y-4"><NotesHero total={0} /><EmptyBlock title="No notes yet" hint="Lesson notes, PDFs and worksheets appear here as your teacher releases lessons." /></div>;
  }

  return (
    <div className="space-y-4">
      <NotesHero total={total} />
      <div className="mx-auto max-w-4xl space-y-4">
      <NotesToolbar query={query} onQuery={setQuery} type={type} onType={setType} available={available} />
      <p className="text-xs text-muted" aria-live="polite">
        {visible.length === total ? `${total} ${total === 1 ? 'file' : 'files'}` : `${visible.length} of ${total} files`}
      </p>
      {fileError ? (
        <div role="alert" className="alert alert-error alert-soft text-sm">
          <span>{fileError}</span>
          <button type="button" className="btn btn-xs" onClick={() => setFileError(null)}>Dismiss</button>
        </div>
      ) : null}
      {groups.length === 0 ? (
        <EmptyBlock title="No matches" hint="Try another word or clear the filter." />
      ) : (
        groups.map(group => (
          <NoteModuleCard key={group.moduleId} group={group} levelCode={levelCodes.get(group.levelId) ?? null} onError={setFileError} />
        ))
      )}
      </div>
    </div>
  );
}
