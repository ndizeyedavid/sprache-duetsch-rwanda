import { FiMoreHorizontal } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { MiniCalendar } from '../../components/ui/Calendar';
import { GroupedBar } from '../../components/charts/GroupedBar';
import { Sparkline } from '../../components/charts/Sparkline';
import { MiniBars } from '../../components/charts/MiniBars';
import { TONE_CLASSES, COLORS } from '../../lib/theme';
import { rwf } from '../../lib/format';
import { adminDashboard, adminUpcomingEvents, adminWorkingActivity, earningsSpark, enrollmentBars } from '../../data/mock';

export function AdminDashboard() {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="space-y-5 xl:col-span-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Panel>
            <h2 className="text-sm font-semibold">Total Students</h2>
            <div className="mt-3 flex items-end justify-between gap-3">
              <span className="text-xl font-semibold">{adminDashboard.totalStudents.toLocaleString('en-US').replace(',', '.')}</span>
              <MiniBars bars={enrollmentBars} />
            </div>
            <p className="mt-3 text-[11px]">
              <span className="font-semibold text-coral">{adminDashboard.studentDelta}</span>{' '}
              <span className="text-muted">than last year</span>
            </p>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-xl bg-brand-soft text-sm font-semibold text-brand">
                A1
              </span>
              <span className="text-lg font-semibold">{adminDashboard.courses}</span>
              <span className="text-[11px] font-medium text-brand">+15% than last year</span>
            </div>
            <h2 className="mt-4 text-sm font-semibold">Courses</h2>
            <p className="mt-1 text-[11px] text-muted">Aktive Stufen und Kurse in allen Standorten</p>
          </Panel>

          <Panel>
            <h2 className="text-sm font-semibold">Earnings</h2>
            <Sparkline data={earningsSpark} color={COLORS.brand} height={56} className="mt-2" />
            <p className="mt-3 text-base font-semibold">{rwf(adminDashboard.earnings)}</p>
            <p className="mt-1 text-[11px] font-medium text-brand">+15% ↑</p>
          </Panel>
        </div>

        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold sm:text-lg">Working Activity</h2>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-field border border-line px-3 py-1.5">
                <span className="flex size-6 items-center justify-center rounded-lg bg-brand-soft text-[10px] font-semibold text-brand">
                  P
                </span>
                <span>
                  <span className="block text-[10px] text-muted">Performance</span>
                  <span className="block text-xs font-semibold">{adminDashboard.performance.toLocaleString('en-US')}</span>
                </span>
              </span>
              <span className="flex items-center gap-2 rounded-field border border-line px-3 py-1.5">
                <span className="flex size-6 items-center justify-center rounded-lg bg-sun-soft text-[10px] font-semibold text-sun">
                  I
                </span>
                <span>
                  <span className="block text-[10px] text-muted">Impression</span>
                  <span className="block text-xs font-semibold">{adminDashboard.impressions.toLocaleString('en-US')}</span>
                </span>
              </span>
            </div>
          </div>
          <GroupedBar
            data={adminWorkingActivity}
            xKey="month"
            barSize={6}
            series={[
              { key: 'planned', label: 'Planned', color: COLORS.grid },
              { key: 'morning', label: 'Morning', color: COLORS.brand },
              { key: 'evening', label: 'Evening', color: COLORS.sun },
            ]}
            height={260}
          />
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <MiniCalendar marked={[5, 6]} selected={6} />
        </Panel>

        <Panel>
          <h2 className="text-base font-semibold">Upcoming Events</h2>
          <div className="mt-4 space-y-5">
            {adminUpcomingEvents.map((group, index) => (
              <div key={`${group.date}-${index}`}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{group.date}</h3>
                  <FiMoreHorizontal className="text-muted" aria-hidden />
                </div>
                <ul className="space-y-3">
                  {group.events.map((event) => (
                    <li key={event.id} className="flex gap-3">
                      <span className="w-16 shrink-0 pt-0.5 text-[11px] text-muted">{event.time}</span>
                      <span
                        className={`border-l-2 pl-3 ${TONE_CLASSES[event.tone].text}`}
                        style={{ borderColor: TONE_CLASSES[event.tone].hex }}
                      >
                        <span className="block text-[10px]">{event.category}</span>
                        <span className="block text-xs font-semibold text-ink">{event.title}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
