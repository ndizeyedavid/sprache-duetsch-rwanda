import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import { Panel } from "../../components/ui/Panel";
import { StatTile } from "../../components/ui/StatTile";
import { ProgressRow } from "../../components/ui/ProgressBar";
import { GroupedBar } from "../../components/charts/GroupedBar";
import { RadialStat } from "../../components/charts/RadialStat";
import { ScheduleCard } from "../../components/cards/ScheduleCard";
import {
  EmptyBlock,
  ErrorBlock,
  LoadingBlock,
} from "../../components/common/PageState";
import { useApi } from "../../hooks/useApi";
import { COLORS } from "../../lib/theme";
import { photos } from "../../lib/images";
import { rwf } from "../../lib/format";
import {
  getStudentDashboard,
  getUpcomingSessions,
  isoDate,
  isoTime,
  money,
} from "../../lib/services";
import {
  sessionStatusLabel,
  sessionTone,
  teacherName,
} from "../../lib/sessions-ui";

const AVATARS = [photos.clarisse, photos.nadine, photos.jeanPaul, photos.aline];

export function Dashboard() {
  const dashboard = useApi("student-dashboard", getStudentDashboard);
  const upcoming = useApi("upcoming-sessions", getUpcomingSessions);

  if (dashboard.loading)
    return <LoadingBlock label="Loading your dashboard…" />;
  if (dashboard.error || !dashboard.data) {
    return (
      <ErrorBlock
        message={dashboard.error ?? "Could not load your dashboard."}
        onRetry={dashboard.refetch}
      />
    );
  }

  const data = dashboard.data;
  const sessions = upcoming.data ?? [];
  const attendanceBars = [
    {
      label: "Sessions",
      present: data.attendance.present,
      absent: data.attendance.absent,
      late: data.attendance.late,
      excused: data.attendance.excused,
    },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="space-y-5 xl:col-span-8">
        <section className="card-shadow relative overflow-hidden rounded-box bg-brand text-white">
          <div className="relative z-10 max-w-md p-6 sm:p-8">
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/70">
              {data.currentLevel
                ? `${data.currentLevel.code} · ${data.currentLevel.title}`
                : "No active level"}
            </p>
            <h2 className="mt-1 text-xl font-semibold leading-snug sm:text-2xl">
              Weiter geht&apos;s — {data.progress.lessonsCompleted} of{" "}
              {data.progress.lessonsTotal} lessons done
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-white/80 sm:text-sm">
              {data.campus ? `${data.campus.name} · ` : ""}
              {data.classGroup
                ? `${data.classGroup.name}`
                : "No class assigned yet."}
              {data.finance.balance
                ? ` · Balance ${rwf(money(data.finance.balance))}`
                : ""}
            </p>
          </div>
          <img
            src={"/student-hero.png"}
            alt="Student holding German course materials"
            className="pointer-events-none absolute -bottom-1 right-0 hidden h-full w-64 object-cover object-[10px_-30px] sm:block lg:w-80"
          />
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Syllabus progress"
            value={`${data.progress.completionPercentage}%`}
            tone="brand"
            variant="solid"
            icon={FiBookOpen}
          />
          <StatTile
            label="Attendance rate"
            value={`${data.attendance.percentage}%`}
            tone="sun"
            variant="solid"
            icon={FiTrendingUp}
          />
          <StatTile
            label="Unread notifications"
            value={String(data.unreadNotificationsCount)}
            tone="navy"
            variant="solid"
            icon={FiCalendar}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <h2 className="mb-4 text-base font-semibold sm:text-lg">
              Attendance breakdown
            </h2>
            <GroupedBar
              data={attendanceBars}
              xKey="label"
              barSize={22}
              series={[
                { key: "present", label: "Present", color: COLORS.brand },
                { key: "late", label: "Late", color: COLORS.sun },
                { key: "absent", label: "Absent", color: COLORS.coral },
                { key: "excused", label: "Excused", color: "#A098AE" },
              ]}
              height={240}
            />
          </Panel>

          <Panel className="flex flex-col items-center justify-center text-center">
            <RadialStat
              value={data.progress.completionPercentage}
              size={168}
              className="mx-auto"
            >
              <span className="text-2xl font-semibold text-ink">
                {data.progress.completionPercentage}%
              </span>
              <span className="mt-1 max-w-28 text-[11px] leading-snug text-muted">
                of your {data.currentLevel?.code ?? ""} syllabus finished
              </span>
            </RadialStat>
            <h3 className="mt-5 text-sm font-semibold">My Progress</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {data.nextLesson
                ? `Next up: ${data.nextLesson.title}`
                : "All published lessons are complete. Well done!"}
            </p>
            <Link
              to="/courses"
              className="btn btn-sm mt-4 rounded-full border-0 bg-brand text-white hover:bg-brand/90"
            >
              More Details
            </Link>
          </Panel>
        </div>

        <Panel>
          <h2 className="mb-4 text-base font-semibold sm:text-lg">
            Learning status
          </h2>
          <ProgressRow
            label="Lessons completed"
            value={data.progress.completionPercentage}
            caption={`${data.progress.lessonsCompleted}/${data.progress.lessonsTotal}`}
            tone="brand"
          />
          <ProgressRow
            label="Attendance"
            value={data.attendance.percentage}
            caption={`${data.attendance.present} present`}
            tone="sun"
          />
          {data.nextExam ? (
            <p className="mt-3 text-xs text-muted">
              Next exam:{" "}
              <span className="font-semibold text-ink">
                {data.nextExam.title}
              </span>{" "}
              ({data.nextExam.type})
            </p>
          ) : (
            <p className="mt-3 text-xs text-muted">
              No upcoming exam scheduled.
            </p>
          )}
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Upcoming Schedule</h2>
              <p className="text-[11px] text-muted">
                {data.upcomingClass
                  ? `${isoDate(data.upcomingClass.startAt)} · ${isoTime(data.upcomingClass.startAt)}`
                  : "No class scheduled"}
              </p>
            </div>
            <Link
              to="/schedule"
              className="btn btn-sm btn-circle border-0 bg-brand-tint text-brand hover:bg-brand-soft"
              aria-label="Open schedule"
            >
              +
            </Link>
          </div>
          {upcoming.loading ? (
            <LoadingBlock label="Loading sessions…" />
          ) : upcoming.error ? (
            <ErrorBlock message={upcoming.error} onRetry={upcoming.refetch} />
          ) : sessions.length === 0 ? (
            <EmptyBlock
              title="No upcoming classes"
              hint="Your teacher has not scheduled the next live class yet."
            />
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 4).map((session, index) => (
                <ScheduleCard
                  key={session.id}
                  title={session.title}
                  teacher={teacherName(session.teacher)}
                  photo={AVATARS[index % AVATARS.length]}
                  date={isoDate(session.startAt)}
                  time={`${isoTime(session.startAt)} – ${isoTime(session.endAt)}`}
                  tone={sessionTone(session.status)}
                  status={sessionStatusLabel(session.status)}
                />
              ))}
            </div>
          )}
        </Panel>

        <Link
          to="/schedule"
          className="btn btn-block rounded-full border-line bg-base-100 text-ink shadow-none hover:bg-base-100"
        >
          More Schedule
          <FiArrowRight aria-hidden />
        </Link>
      </div>
    </div>
  );
}
