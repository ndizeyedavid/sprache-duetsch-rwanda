import { FiArrowUpRight,FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { StudentDashboard } from '../../lib/services';
import { ATTENDANCE_GOAL,attendanceMessage } from './attendance-goal';
import { CardArtPanel } from './CardArtPanel';

export function DashboardAttendanceCard({ attendance }: { attendance: StudentDashboard['attendance'] }) {
  const rows = [
    { label: 'Present', value: attendance.present, color: 'bg-primary' },
    { label: 'Late', value: attendance.late, color: 'bg-secondary' },
    { label: 'Absent', value: attendance.absent, color: 'bg-error' },
    { label: 'Excused', value: attendance.excused, color: 'bg-info' },
  ];
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  const message = attendanceMessage(attendance.percentage, total);
  return (
    <section className="card learning-panel h-full gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Attendance</h2><Link to="/attendance" aria-label="Open your attendance" className="btn btn-ghost btn-xs btn-circle"><FiArrowUpRight aria-hidden /></Link></div>
      <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-full bg-primary text-primary-content"><FiCheckCircle aria-hidden className="text-2xl text-primary" /></span><div><p className="text-3xl font-semibold">{total ? `${attendance.percentage}%` : '—'}</p><p className="mt-1 text-[0.625rem] text-muted">{total ? `${total} ${total === 1 ? 'class' : 'classes'} recorded` : 'After your first class'}</p></div></div>
      <div className="flex h-2 overflow-hidden rounded-full bg-base-200" aria-hidden>{rows.map((row) => <span key={row.label} className={row.color} style={{ width: `${total ? row.value / total * 100 : 0}%` }} />)}</div>
      <dl className="grid grid-cols-2 gap-3">{rows.map((row) => <div key={row.label} className="flex items-center gap-2 text-[0.6875rem]"><span aria-hidden className={`size-1.5 rounded-full ${row.color}`} /><dt className="text-muted">{row.label}</dt><dd className="ml-auto font-semibold">{row.value}</dd></div>)}</dl>
      <CardArtPanel art="attendance">
        <p className={`text-base font-semibold leading-tight ${total && attendance.percentage < ATTENDANCE_GOAL ? 'text-error' : 'text-primary'}`}>{message.heading}</p>
        <p className="text-xs leading-5 text-muted">{message.text}</p>
        <div className="relative mt-1 h-1.5 rounded-full bg-base-100" aria-label={`Goal ${ATTENDANCE_GOAL}%`}>
          <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${total ? attendance.percentage : 0}%` }} />
          <span className="absolute -top-1 h-3.5 w-0.5 rounded bg-base-content" style={{ left: `${ATTENDANCE_GOAL}%` }} aria-hidden />
        </div>
        <span className="text-[0.625rem] text-muted">Goal: {ATTENDANCE_GOAL}%</span>
      </CardArtPanel>
    </section>
  );
}
