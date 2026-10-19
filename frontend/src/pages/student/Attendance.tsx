import { FiCalendar,FiCheckSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { STATUS_META } from '../../components/attendance/constants';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { heroGhost } from '../../components/hero/hero-actions';
import { PageHero } from '../../components/hero/PageHero';
import { useApi } from '../../hooks/useApi';
import { getMyAttendance } from '../../lib/services';

export function StudentAttendance() {
  const attendance = useApi('my-attendance', getMyAttendance);
  const s = attendance.data?.summary;
  const stats = [
    { label: 'Attendance rate', value: s?.total ? `${s.percentage}%` : '—' },
    { label: 'Present or late', value: (s?.present ?? 0) + (s?.late ?? 0) },
    { label: 'Absent', value: s?.absent ?? 0 },
    { label: 'Excused', value: s?.excused ?? 0 },
  ];
  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Class records"
        icon={FiCheckSquare}
        title="Your attendance"
        description="Your attendance and teacher notes. Ask your teacher for corrections."
        art="attendance"
        meta={s?.total ? <span className="hero-chip hero-chip-solid">{s.total} marked {s.total === 1 ? 'class' : 'classes'}</span> : null}
        actions={<Link to="/schedule" className={heroGhost}><FiCalendar aria-hidden />My schedule</Link>}
      />
      {attendance.loading ? <LoadingBlock label="Loading attendance…" /> : attendance.error ? <ErrorBlock message={attendance.error} onRetry={attendance.refetch} /> : <>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(stat => <section key={stat.label} className="card border border-base-300 bg-base-100 p-5"><p className="text-xs text-muted">{stat.label}</p><p className="mt-2 text-3xl font-semibold">{stat.value}</p></section>)}
        </div>
        <p className="text-xs text-muted">Rate = present + late / marked sessions. Cancelled and unmarked sessions are excluded.</p>
        <section className="card overflow-hidden border border-base-300 bg-base-100">
          <h2 className="border-b border-base-300 p-5 text-sm font-semibold">Your class history</h2>
          {!attendance.data?.history.length ? <div className="p-8"><EmptyBlock title="No attendance records yet" hint="Your teacher will record attendance when your classes start." /></div>
            : attendance.data.history.map(r => {
              const status = STATUS_META[r.status as keyof typeof STATUS_META];
              return <article key={r.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-base-300 p-5 last:border-0">
                <div>
                  <h3 className="text-sm font-semibold">{r.session.title || 'Class session'}</h3>
                  <p className="mt-1 text-xs text-muted">{new Date(r.session.startAt).toLocaleString('en-GB')}</p>
                  {r.note ? <p className="mt-3 max-w-xl whitespace-pre-wrap break-words rounded-xl bg-base-200 p-3 text-xs leading-5">{r.note}</p> : null}
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs ${status?.chip ?? 'bg-base-200'}`}>{status?.label ?? r.status}</span>
              </article>;
            })}
        </section>
      </>}
    </div>
  );
}
