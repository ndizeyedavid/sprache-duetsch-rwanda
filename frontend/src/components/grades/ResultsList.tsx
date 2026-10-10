import { FiInbox } from 'react-icons/fi';
import type { GradeEntry } from './result-model';
import { ResultRow } from './ResultRow';
export function ResultsList({ entries, reset }: { entries: GradeEntry[]; reset: () => void }) {
  if (!entries.length) return <div className="card items-center border border-base-300 bg-base-100 px-5 py-12 text-center"><FiInbox aria-hidden size={30} className="text-muted" /><h2 className="mt-4 font-semibold">No results in this view</h2><p className="mt-2 max-w-sm text-sm text-muted">Try another status or course. Published tasks will appear here as your course progresses.</p><button onClick={reset} className="btn btn-sm mt-5">Show all tasks</button></div>;
  return <section className="card overflow-hidden border border-base-300 bg-base-100"><div className="flex items-center justify-between gap-3 border-b border-base-300 bg-base-200 px-5 py-4 sm:px-6"><h2 className="text-sm font-semibold">Your work</h2><span className="text-xs text-muted">{entries.length} task{entries.length === 1 ? '' : 's'}</span></div>{entries.map(e => <ResultRow key={e.id} entry={e} />)}</section>;
}
