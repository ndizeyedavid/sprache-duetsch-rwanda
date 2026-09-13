import { FiChevronRight, FiPlus } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { DateTile, MonthCalendar } from '../../components/ui/Calendar';
import type { CalendarEvent } from '../../components/ui/Calendar';
import { KebabMenu } from '../../components/ui/KebabMenu';
import { TONE_CLASSES } from '../../lib/theme';
import { GANTT_DAYS, GANTT_HOURS, adminTasks } from '../../data/mock';
import type { Tone } from '../../types';

const CALENDAR_EVENTS: CalendarEvent[] = [
  { day: 1, label: 'Deutsch A2', tone: 'coral', time: '10.00 AM' },
  { day: 10, label: 'Konversation B1', tone: 'sun', time: '10.00 AM' },
  { day: 17, label: 'Prüfung B1', tone: 'brand', time: '10.00 AM' },
  { day: 22, label: 'Berufsdeutsch', tone: 'coral', time: '10.00 AM' },
  { day: 26, label: 'Aussprache A1', tone: 'brand', time: '10.00 AM' },
];

const UPCOMING: { id: string; title: string; time: string; day: string; month: string; tone: Tone }[] = [
  { id: 'us-1', title: 'Deutsch A2 — Grammatik', time: '07.00 - 08.00 AM', day: '5', month: 'Jan', tone: 'brand' },
  { id: 'us-2', title: 'Konversation B1', time: '07.00 - 08.00 AM', day: '5', month: 'Jan', tone: 'sun' },
];

export function AdminSchedule() {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="xl:col-span-8">
        <Panel>
          <MonthCalendar
            events={CALENDAR_EVENTS}
            action={
              <button
                type="button"
                className="btn btn-sm gap-2 rounded-full border-0 bg-brand text-white hover:bg-brand/90"
              >
                <FiPlus aria-hidden />
                New Schedule
              </button>
            }
          />
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Upcoming Task</h2>
            <KebabMenu label="Upcoming task options" />
          </div>
          <div className="overflow-x-auto scrollbar-none">
            <div className="min-w-[22rem] space-y-3">
              <div className="grid grid-cols-[2.5rem_repeat(5,1fr)] gap-2 text-[10px] text-muted">
                <span />
                {GANTT_HOURS.map((hour) => (
                  <span key={hour} className="text-center">
                    {hour}
                  </span>
                ))}
              </div>
              {GANTT_DAYS.map((day, index) => {
                const tasks = adminTasks.filter((task) => task.day === index + 1);
                return (
                  <div
                    key={day}
                    className="grid grid-cols-[2.5rem_repeat(5,1fr)] items-center gap-2 border-t border-dashed border-line pt-2"
                  >
                    <span className="text-[11px] text-muted">{day}</span>
                    {tasks.length > 0 ? (
                      tasks.map((task) => (
                        <span
                          key={task.id}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-medium text-white ${TONE_CLASSES[task.tone].bg}`}
                          style={{ gridColumn: `${task.start + 1} / span ${task.span}` }}
                        >
                          <span className="size-1.5 rounded-full bg-white" aria-hidden />
                          <span className="truncate">{task.label}</span>
                        </span>
                      ))
                    ) : (
                      <span aria-hidden />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-base font-semibold">Upcoming Schedule</h2>
          <ul className="space-y-3">
            {UPCOMING.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-field border border-line p-3"
              >
                <span
                  aria-hidden
                  className="w-1 self-stretch rounded-full"
                  style={{ backgroundColor: TONE_CLASSES[item.tone].hex }}
                />
                <DateTile day={item.day} month={item.month} tone={item.tone} />
                <span className="min-w-0 grow">
                  <span className="block truncate text-sm font-semibold">{item.title}</span>
                  <span className="mt-0.5 block text-[11px] text-muted">{item.time}</span>
                </span>
                <FiChevronRight className="shrink-0 text-muted" aria-hidden />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
