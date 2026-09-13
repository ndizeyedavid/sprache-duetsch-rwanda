import { FiChevronRight } from 'react-icons/fi';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { MiniCalendar, DateTile } from '../../components/ui/Calendar';
import { DayTimeline } from '../../components/ui/DayTimeline';
import { RadialStat } from '../../components/charts/RadialStat';
import { TONE_CLASSES } from '../../lib/theme';
import { calendarLegend, ongoingClasses, scheduleTimeline, upcomingSchedule } from '../../data/mock';

export function Schedule() {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="space-y-5 xl:col-span-8">
        <Panel>
          <h2 className="mb-4 text-base font-semibold sm:text-lg">Ongoing Class</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ongoingClasses.map((item) => {
              const tone = TONE_CLASSES[item.tone];
              return (
                <div key={item.id} className="flex items-center gap-4 rounded-box bg-base-200 p-4">
                  <span className={`flex size-14 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${tone.soft} ${tone.text}`}>
                    {item.progress}%
                  </span>
                  <span className="min-w-0 grow">
                    <span className="block truncate text-sm font-medium">{item.title}</span>
                    <ProgressBar value={item.progress} tone={item.tone} className="mt-2" />
                  </span>
                  <FiChevronRight className="shrink-0 text-muted" aria-hidden />
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold sm:text-lg">Today Schedule</h2>
            <span className="text-[11px] text-muted">Heute · 07:00 — 17:00</span>
          </div>
          <DayTimeline events={scheduleTimeline} className="pt-4" />
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <h2 className="mb-4 text-base font-semibold sm:text-lg">Calendar</h2>
          <MiniCalendar marked={[5, 17]} selected={5} />
          <div className="mt-5 flex items-center gap-4 border-t border-line pt-5">
            <RadialStat value={15} size={120} color="#FEC64F" trackColor="#FFF6E5">
              <span className="text-sm font-semibold text-ink">+15%</span>
            </RadialStat>
            <div className="min-w-0">
              <p className="text-xs font-medium">Your Progress this Month</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted">
                Du hast diesen Monat 15% mehr Lektionen abgeschlossen als im Vormonat.
              </p>
            </div>
          </div>
          <ul className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
            {calendarLegend.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-[11px] text-muted">
                <span
                  className={`size-2 rounded-full ${TONE_CLASSES[item.tone].bg}`}
                  aria-hidden
                />
                {item.label}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <SectionHeader title="Upcoming Schedule" action={{ label: 'View all', to: '/schedule' }} />
          <ul className="space-y-3">
            {upcomingSchedule.map((event) => (
              <li key={event.id}>
                <div className="flex items-center gap-3 rounded-field bg-base-200 p-3">
                  <DateTile day={event.date.split(' ')[0]} month={event.date.split(' ')[1]?.slice(0, 3) ?? ''} tone={event.tone} />
                  <span className="min-w-0 grow">
                    <span className="block truncate text-xs font-semibold">{event.title}</span>
                    <span className="mt-0.5 block truncate text-[10px] text-muted">{event.time}</span>
                  </span>
                  <FiChevronRight className="shrink-0 text-muted" aria-hidden />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
