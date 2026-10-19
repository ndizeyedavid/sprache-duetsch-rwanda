import { FiChevronRight,FiPlusCircle,FiSlash } from 'react-icons/fi';
import { Link,useNavigate } from 'react-router-dom';
import { humanize } from '../../../lib/services';
import type { StudentRow } from '../../../lib/services/student-row';
import { balanceOf } from '../../payments/quick-pay/quick-pay';
import { StudentBalanceCell } from '../../payments/quick-pay/StudentBalanceCell';
import { ReinstateButton } from '../../student-suspension/ReinstateButton';
import { StatusBadge } from '../../ui/StatusBadge';

type Suspension = { onSuspend: (row: StudentRow) => void; onDone: (message: string) => void; onError: (message: string) => void };
type Props = { rows: StudentRow[]; money: boolean; onPay: (row: StudentRow) => void; /** Academic/super admins: suspend or reinstate from the row. */ suspension?: Suspension };

const ROW_BTN = 'btn btn-ghost btn-xs gap-1 whitespace-nowrap rounded-full';

/** The student register; finance roles also see each balance and a one-click "Record payment". */
export function StudentsTable({ rows, money, onPay, suspension }: Props) {
  const navigate = useNavigate();
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="table w-full text-xs">
        <thead>
          <tr className="text-muted">
            <th className="text-left">Student</th>
            <th className="text-left">Student ID</th>
            <th className="text-left">Level</th>
            {money ? null : <th className="text-left">Campus</th>}
            <th className="text-left">Status</th>
            {money ? <th className="text-left">Balance</th> : null}
            <th><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const info = money ? balanceOf(row) : null;
            return (
              <tr key={row.id} onClick={() => navigate(`/admin/students/${row.id}${money ? '?tab=payments' : ''}`)} className="cursor-pointer border-t border-line hover:bg-base-200">
                <td className="py-3 pr-4">
                  <Link to={`/admin/students/${row.id}`} onClick={(event) => event.stopPropagation()} className="font-semibold hover:underline">{row.user.firstName} {row.user.lastName}</Link>
                  <p className="text-muted">{row.user.email}</p>
                </td>
                <td className="py-3 pr-4 font-medium">{row.studentCode}</td>
                <td className="py-3 pr-4">{row.currentLevel?.code ?? '—'}</td>
                {money ? null : <td className="py-3 pr-4">{row.campus?.name ?? '—'}</td>}
                <td className="py-3 pr-4"><StatusBadge status={humanize(row.status)} /></td>
                {money ? <td className="py-3 pr-4">{info ? <StudentBalanceCell info={info} /> : <span className="text-muted">No fees yet</span>}</td> : null}
                <td className="py-3 text-right">
                  <span className="inline-flex items-center gap-1">
                  {suspension ? (row.user.status === 'SUSPENDED' ? (
                    <ReinstateButton studentId={row.id} name={`${row.user.firstName} ${row.user.lastName}`} className={`${ROW_BTN} text-primary`} onDone={suspension.onDone} onError={suspension.onError} />
                  ) : (
                    <button type="button" onClick={(event) => { event.stopPropagation(); suspension.onSuspend(row); }} className={`${ROW_BTN} text-error`}>
                      <FiSlash aria-hidden />Suspend
                    </button>
                  )) : null}
                  {money && info && info.balance > 0 ? (
                    <button type="button" onClick={(event) => { event.stopPropagation(); onPay(row); }} className="btn btn-primary btn-sm gap-1.5 whitespace-nowrap rounded-full">
                      <FiPlusCircle aria-hidden />Record payment
                    </button>
                  ) : <FiChevronRight aria-hidden className="ml-auto text-muted" />}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
