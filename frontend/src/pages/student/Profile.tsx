import { useState } from 'react';
import { FiAward, FiChevronRight, FiClock } from 'react-icons/fi';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { RadialStat } from '../../components/charts/RadialStat';
import { AreaTrend } from '../../components/charts/AreaTrend';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { KebabMenu } from '../../components/ui/KebabMenu';
import { COLORS } from '../../lib/theme';
import { currentCourses, currentUser, profileProgress } from '../../data/mock';

const ACHIEVEMENTS = ['🏆', '🎖️', '🚀', '🎯', '📚', '🧠'];

export function Profile() {
  const [range, setRange] = useState('This Week');

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <Panel className="xl:col-span-4">
        <div className="flex items-start justify-between">
          <span />
          <KebabMenu label="Profile options" />
        </div>
        <div className="-mt-2 text-center">
          <img
            src={currentUser.photo}
            alt={currentUser.name}
            className="mx-auto size-24 rounded-2xl object-cover"
          />
          <h1 className="mt-4 text-base font-semibold">{currentUser.name}</h1>
          <p className="mt-1 text-[11px] text-muted">{currentUser.memberSince}</p>
          <p className="mt-1 text-[11px] text-muted">
            {currentUser.studentId} · {currentUser.level} · {currentUser.campus}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-field bg-base-200 px-4 py-3">
            <p className="text-[11px] text-muted">Points</p>
            <p className="mt-1 text-lg font-semibold">{currentUser.points}</p>
          </div>
          <div className="rounded-field bg-base-200 px-4 py-3">
            <p className="text-[11px] text-muted">Certificate</p>
            <p className="mt-1 text-lg font-semibold">{currentUser.certificates}</p>
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold">Achievements</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {ACHIEVEMENTS.map((badge) => (
            <li
              key={badge}
              className="flex size-11 items-center justify-center rounded-xl bg-base-200 text-lg"
              aria-hidden
            >
              {badge}
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-sm font-semibold">Bio</h2>
        <p className="mt-3 rounded-field bg-base-200 p-4 text-xs leading-relaxed text-muted">
          {currentUser.bio}
        </p>
      </Panel>

      <div className="space-y-5 xl:col-span-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-soft text-xl text-brand">
              <FiAward aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold">100</span>
              <span className="block text-[11px] text-muted">Courses Completed</span>
            </span>
            <FiChevronRight className="ml-auto text-muted" aria-hidden />
          </Panel>
          <Panel className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-sun-soft text-xl text-sun">
              <FiClock aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold">34</span>
              <span className="block text-[11px] text-muted">Courses In Progress</span>
            </span>
            <FiChevronRight className="ml-auto text-muted" aria-hidden />
          </Panel>
        </div>

        <Panel>
          <SectionHeader title="Current Courses" action={{ label: 'View all', to: '/courses' }} />
          <div className="grid gap-4 sm:grid-cols-2">
            {currentCourses.map((course, index) => (
              <div key={course.id} className="flex items-center gap-4 rounded-box bg-base-200 p-4">
                <RadialStat
                  value={course.progress}
                  size={104}
                  thickness={10}
                  color={index === 0 ? COLORS.brand : COLORS.sun}
                  trackColor={index === 0 ? COLORS.brandSoft : COLORS.sunSoft}
                >
                  <span className="text-sm font-semibold text-ink">{course.progress}%</span>
                </RadialStat>
                <span className="min-w-0">
                  <span className="block text-[11px] text-muted">{course.label}</span>
                  <span className="mt-1 block text-sm font-semibold leading-snug">{course.title}</span>
                  <span className="mt-2 block text-[11px] text-muted">Total Courses</span>
                  <span className="block text-xs font-medium">{course.total}</span>
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold sm:text-lg">Progress</h2>
            <div className="flex items-center gap-3">
              <SegmentedControl
                options={['Last Week', 'This Week']}
                value={range}
                onChange={setRange}
                ariaLabel="Progress range"
              />
              <KebabMenu label="Progress options" />
            </div>
          </div>
          <AreaTrend
            data={profileProgress}
            xKey="day"
            series={[
              { key: 'lastWeek', label: 'Last Week', color: COLORS.sun },
              { key: 'thisWeek', label: 'This Week', color: COLORS.brand },
            ]}
            height={240}
            showLegend
          />
          <div className="mt-4 flex flex-wrap gap-6 border-t border-line pt-4">
            <span className="flex items-center gap-2 text-xs">
              <span className="size-2 rounded-full bg-brand" aria-hidden />
              This week <span className="font-semibold text-brand">+32%</span>
            </span>
            <span className="flex items-center gap-2 text-xs">
              <span className="size-2 rounded-full bg-sun" aria-hidden />
              Last Week <span className="font-semibold text-sun">+24%</span>
            </span>
          </div>
        </Panel>
      </div>
    </div>
  );
}
