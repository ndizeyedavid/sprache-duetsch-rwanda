import { useState } from "react";
import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import { Panel } from "../../components/ui/Panel";
import { StatTile } from "../../components/ui/StatTile";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { ProgressRow } from "../../components/ui/ProgressBar";
import { LineTrend } from "../../components/charts/LineTrend";
import { GroupedBar } from "../../components/charts/GroupedBar";
import { RadialStat } from "../../components/charts/RadialStat";
import { MiniCalendar } from "../../components/ui/Calendar";
import { KebabMenu } from "../../components/ui/KebabMenu";
import { ScheduleCard } from "../../components/cards/ScheduleCard";
import { COLORS } from "../../lib/theme";
import { hero } from "../../lib/images";
import { monthlySeries, upcomingSchedule } from "../../data/mock";

const SCORE_TABS = ["Last Month", "This Month", "This Years"];

export function Dashboard() {
  const [activity, setActivity] = useState("This Week");
  const [score, setScore] = useState("This Years");
  const series =
    activity === "This Week"
      ? [{ key: "thisWeek", label: "This Week", color: COLORS.brand }]
      : [{ key: "lastWeek", label: "Last Week", color: COLORS.sun }];

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="space-y-5 xl:col-span-8">
        <section className="card-shadow relative overflow-hidden rounded-box bg-brand text-white">
          <div className="relative z-10 max-w-md p-6 sm:p-8">
            <h2 className="text-xl font-semibold leading-snug sm:text-2xl">
              Join Now and Get Discount Voucher Up To 20%
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-white/80 sm:text-sm">
              Enrol in any A1–B2 level before the end of the intake and pay your
              first installment at a reduced rate.
            </p>
          </div>
          <img
            src={hero}
            alt="Student holding German course materials"
            className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-64 object-cover object-top sm:block lg:w-72"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -left-6 bottom-0 hidden text-7xl font-bold text-white/10 sm:block"
          >
            A1–B2
          </span>
        </section>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="Completed Courses"
            value="1.500"
            tone="brand"
            variant="solid"
            icon={FiBookOpen}
          />
          <StatTile
            label="In Progress Courses"
            value="903"
            tone="sun"
            variant="solid"
            icon={FiTrendingUp}
          />
          <StatTile
            label="Upcoming Courses"
            value="1.112"
            tone="navy"
            variant="solid"
            icon={FiCalendar}
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Panel className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold sm:text-lg">
                Learning Activity
              </h2>
              <div className="flex items-center gap-3">
                <SegmentedControl
                  options={["Last Week", "This Week"]}
                  value={activity}
                  onChange={setActivity}
                  ariaLabel="Learning activity range"
                />
                <KebabMenu label="Learning activity options" />
              </div>
            </div>
            <LineTrend
              data={monthlySeries}
              xKey="month"
              series={series}
              height={240}
            />
          </Panel>

          <Panel className="flex flex-col items-center justify-center text-center">
            <RadialStat value={75} size={168} className="mx-auto">
              <span className="text-2xl font-semibold text-ink">75%</span>
              <span className="mt-1 max-w-28 text-[11px] leading-snug text-muted">
                of your A2 syllabus finished
              </span>
            </RadialStat>
            <h3 className="mt-5 text-sm font-semibold">My Progress</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              You are ahead of schedule. Keep two lessons per week to finish
              before the exam window.
            </p>
            <button
              type="button"
              className="btn btn-sm mt-4 rounded-full border-0 bg-brand text-white hover:bg-brand/90"
            >
              More Details
            </button>
          </Panel>
        </div>

        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold sm:text-lg">
              Score Activity
            </h2>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 text-[11px] text-muted sm:flex">
                <span className="size-2 rounded-full bg-sun" aria-hidden /> Last
                Month
              </span>
              <span className="hidden items-center gap-1.5 text-[11px] text-muted sm:flex">
                <span className="size-2 rounded-full bg-brand" aria-hidden />{" "}
                This Month
              </span>
              <SegmentedControl
                options={SCORE_TABS}
                value={score}
                onChange={setScore}
                ariaLabel="Score range"
              />
              <KebabMenu label="Score activity options" />
            </div>
          </div>
          <GroupedBar
            data={monthlySeries}
            xKey="month"
            barSize={10}
            series={[
              { key: "lastWeek", label: "Last Month", color: COLORS.sun },
              { key: "thisWeek", label: "This Month", color: COLORS.brand },
            ]}
            height={240}
          />
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <MiniCalendar marked={[5, 17]} selected={17} />
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Home Work</h2>
            <KebabMenu label="Homework options" />
          </div>
          <ProgressRow
            label="Web Design"
            value={90}
            caption="9/10"
            tone="sun"
          />
          <ProgressRow
            label="Graphic Design"
            value={40}
            caption="4/10"
            tone="brand"
          />
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Upcoming Schedule</h2>
              <p className="text-[11px] text-muted">
                Thursday, 12th April 2025
              </p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-circle border-0 bg-brand-tint text-brand hover:bg-brand-soft"
              aria-label="Add schedule"
            >
              +
            </button>
          </div>
          <div className="space-y-3">
            {upcomingSchedule.map((event) => (
              <ScheduleCard
                key={event.id}
                title={event.title}
                teacher={event.teacher}
                photo={event.photo}
                date={event.date}
                time={event.time}
                tone={event.tone}
                status={event.status}
              />
            ))}
          </div>
        </Panel>

        <button
          type="button"
          className="btn btn-block rounded-full border-line bg-base-100 text-ink shadow-none hover:bg-base-100"
        >
          More Schedule
          <FiArrowRight aria-hidden />
        </button>
      </div>
    </div>
  );
}
