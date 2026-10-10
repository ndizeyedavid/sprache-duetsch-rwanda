import { FiEdit3 } from 'react-icons/fi';
import type { ApiState } from '../../hooks/useApi';
import { humanize } from '../../lib/services/humanize';
import type { StudentAttempt } from '../../lib/services/list-student-attempts';
import { money } from '../../lib/services/money';
import { SectionState } from '../profile/SectionState';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { dateTime } from './utils';

function result(row: StudentAttempt): { label: string; tone: string } {
  if (row.passed === true) return { label: 'Passed', tone: 'text-brand' };
  if (row.passed === false) return { label: 'Not passed', tone: 'text-error' };
  return { label: 'Awaiting grade', tone: 'text-muted' };
}

export function AttemptsTable({ attempts }: { attempts: ApiState<StudentAttempt[]> }) {
  const rows = attempts.data ?? [];
  return (
    <Panel>
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <FiEdit3 aria-hidden className="text-brand" />Attempts
      </h2>
      <div className="mt-3">
        <SectionState
          loading={attempts.loading}
          loadingLabel="Loading attempts…"
          error={attempts.error}
          onRetry={attempts.refetch}
          isEmpty={!rows.length}
          emptyTitle="No attempts yet"
          emptyHint="Quizzes, tests and exams the student starts are listed here."
        >
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="text-muted"><th>Assessment</th><th>Score</th><th>Result</th><th>Status</th><th>Submitted</th></tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const outcome = result(row);
                  const max = money(row.maxScore);
                  return (
                    <tr key={row.id} className="border-t border-line">
                      <td>
                        <p className="font-medium">{row.assessment.title}</p>
                        <p className="text-xs text-muted">Attempt {row.attemptNumber}{row.cheatFlagged ? ' · integrity flag' : ''}</p>
                      </td>
                      <td className="tabular-nums">
                        {row.score === null ? '—' : `${money(row.score)} / ${max}`}
                        {row.score !== null && max > 0 ? <span className="ml-1 text-xs text-muted">({Math.round((money(row.score) / max) * 100)}%)</span> : null}
                      </td>
                      <td className={`text-xs font-semibold ${outcome.tone}`}>{outcome.label}</td>
                      <td><StatusBadge status={humanize(row.status)} className="px-3 py-1" /></td>
                      <td className="whitespace-nowrap text-xs text-muted">{dateTime(row.submittedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionState>
      </div>
    </Panel>
  );
}
