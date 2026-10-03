import { FiArrowUpRight, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { StudentDashboard } from '../../lib/services';

export function DashboardAttendanceCard({ attendance }: { attendance: StudentDashboard['attendance'] }) {
  const rows = [
    { label: 'Present', value: attendance.present, color: 'bg-primary' },
    { label: 'Late', value: attendance.late, color: 'bg-secondary' },
    { label: 'Absent', value: attendance.absent, color: 'bg-error' },
    { label: 'Excused', value: attendance.excused, color: 'bg-info' },
  ];
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  return (
    <section className="card learning-panel h-full gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Attendance</h2><Link to="/profile" aria-label="View attendance in your profile" className="btn btn-ghost btn-xs btn-circle"><FiArrowUpRight aria-hidden /></Link></div>
      <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-full bg-primary/10"><FiCheckCircle aria-hidden className="text-2xl text-primary" /></span><div><p className="text-3xl font-semibold">{total ? `${attendance.percentage}%` : '—'}</p><p className="mt-1 text-[10px] text-base-content/60">{total ? `${total} ${total === 1 ? 'class' : 'classes'} recorded` : 'After your first class'}</p></div></div>
      <div className="flex h-2 overflow-hidden rounded-full bg-base-200" aria-hidden>{rows.map((row) => <span key={row.label} className={row.color} style={{ width: `${total ? row.value / total * 100 : 0}%` }} />)}</div>
      <dl className="grid grid-cols-2 gap-3">{rows.map((row) => <div key={row.label} className="flex items-center gap-2 text-[11px]"><span aria-hidden className={`size-1.5 rounded-full ${row.color}`} /><dt className="text-base-content/65">{row.label}</dt><dd className="ml-auto font-semibold">{row.value}</dd></div>)}</dl>
      {total > 0 && attendance.percentage < 75 ? <p className="text-[10px] font-medium text-error">Attendance is below 75%. Check in with your teacher.</p> : null}
    </section>
  );
}
