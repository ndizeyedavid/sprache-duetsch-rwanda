import { useMemo, useState } from 'react';
import { FiPlus, FiSearch, FiX } from 'react-icons/fi';
import { Panel } from '../ui/Panel';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { useApi } from '../../hooks/useApi';
import { deleteQuestion, listQuestions, money, humanize } from '../../lib/services';
import { apiErrorMessage } from '../../lib/api';
import { DIFFICULTIES, FRIENDLY_TYPES, SKILLS } from './constants';
import { filterQuestions } from './utils';
import { QuestionCard } from './QuestionCard';
import { QuestionEditorModal } from './QuestionEditorModal';

type Level = { id: string; code: string; title: string };

type Props = { levels: Level[]; selectedLevelId: string | null };

export function QuestionBankPanel({ levels, selectedLevelId }: Props) {
 const questions = useApi('question-bank', listQuestions);
 const [search, setSearch] = useState('');
 const [type, setType] = useState('ALL');
 const [skill, setSkill] = useState('ALL');
 const [difficulty, setDifficulty] = useState('ALL');
 const [editorOpen, setEditorOpen] = useState(false);
 const [editing, setEditing] = useState<null | { id: string }>(null);
 const [error, setError] = useState<string | null>(null);

 const filtered = useMemo(() => filterQuestions(questions.data ?? [], selectedLevelId, search, type, skill, difficulty), [questions.data, selectedLevelId, search, type, skill, difficulty]);
 const levelCode = (id: string) => levels.find((l) => l.id === id)?.code ?? '—';

 async function handleDelete(id: string, prompt: string) {
 if (!confirm(`Delete "${prompt.slice(0, 60)}"?`)) return;
 setError(null);
 try {
 await deleteQuestion(id);
 questions.refetch();
 } catch (err) {
 setError(apiErrorMessage(err, 'Could not delete.'));
 }
 }

 return (
 <>
 <div className="overflow-hidden rounded-box border border-line bg-base-100">
 <div className="border-b border-line bg-base-200/40 px-4 py-3">
 <div className="flex flex-wrap items-center gap-2">
 <div className="relative grow sm:max-w-sm">
 <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
 <input value={search} onChange={(e) => setSearch(e.currentTarget.value)} placeholder="Search questions…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-9" />
 {search ? <button type="button" onClick={() => setSearch('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
 </div>
 <select value={type} onChange={(e) => setType(e.currentTarget.value)} className="select select-sm rounded-full border-line bg-base-100">
 <option value="ALL">All types</option>
 {FRIENDLY_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
 </select>
 <select value={skill} onChange={(e) => setSkill(e.currentTarget.value)} className="select select-sm rounded-full border-line bg-base-100">
 <option value="ALL">All skills</option>
 {SKILLS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
 </select>
 <select value={difficulty} onChange={(e) => setDifficulty(e.currentTarget.value)} className="select select-sm rounded-full border-line bg-base-100">
 <option value="ALL">All levels</option>
 {DIFFICULTIES.map((o) => <option key={o.value} value={o.value}>{humanize(o.value)}</option>)}
 </select>
 <button type="button" onClick={() => { setEditing(null); setEditorOpen(true); }} className="btn btn-sm ml-auto gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90"><FiPlus aria-hidden />New question</button>
 </div>
 <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
 <span>{filtered.length} of {(questions.data ?? []).filter((q) => !selectedLevelId || q.levelId === selectedLevelId).length} questions</span>
 <span>·</span>
 <span>{money(filtered.reduce((acc, q) => acc + money(q.points as string), 0))} pts total</span>
 {(type !== 'ALL' || skill !== 'ALL' || difficulty !== 'ALL' || search) ? <button type="button" onClick={() => { setType('ALL'); setSkill('ALL'); setDifficulty('ALL'); setSearch(''); }} className="link link-hover text-brand">Clear filters</button> : null}
 </div>
 {error ? <p role="alert" className="mt-2 text-xs font-medium text-error">{error}</p> : null}
 </div>

 <div className="p-4">
 {questions.loading ? <LoadingBlock label="Loading question bank…" /> : questions.error ? <ErrorBlock message={questions.error} onRetry={questions.refetch} /> : filtered.length === 0 ? <EmptyBlock title="No questions match" hint="Adjust filters or add a new question." /> : (
 <ul className="space-y-2">{filtered.slice(0, 80).map((q) => (
 <QuestionCard key={q.id} question={q as never} levelCode={levelCode(q.levelId)} onEdit={() => { setEditing({ id: q.id }); setEditorOpen(true); }} onDelete={() => void handleDelete(q.id, q.prompt)} />
 ))}</ul>
 )}
 {filtered.length > 80 ? <p className="mt-3 text-center text-xs text-muted">Showing 80 of {filtered.length} — refine search to see more.</p> : null}
 </div>
 </div>

 <Panel className="border-l-4 border-l-sun bg-[#fffbeb]">
 <h4 className="text-xs font-bold">How the bank works</h4>
 <p className="mt-1 text-xs leading-snug text-muted">Questions are reusable. Create them once, then pick which ones go into each assessment. Editing a question updates the bank — assessments that already use it keep a snapshot until you re-assign.</p>
 </Panel>

 <QuestionEditorModal open={editorOpen} onClose={() => setEditorOpen(false)} levels={levels} initialLevelId={selectedLevelId ?? levels[0]?.id ?? ''} editing={editing} onSaved={() => questions.refetch()} />
 </>
 );
}
