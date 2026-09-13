import { useState } from 'react';
import { FiBookOpen, FiStar, FiTrendingUp } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { GroupedBar } from '../../components/charts/GroupedBar';
import { DonutChart } from '../../components/charts/DonutChart';
import { LegendRow } from '../../components/ui/LegendRow';
import { KebabMenu } from '../../components/ui/KebabMenu';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Rating } from '../../components/ui/Rating';
import { COLORS } from '../../lib/theme';
import { popularClassRows, popularClasses, sellingActivity, topCourses, userReviews } from '../../data/mock';
import type { Tone } from '../../types';

const RANGES = ['Insight', 'Selling'];

const KPIS: { id: string; label: string; value: string; tone: Tone; icon: typeof FiBookOpen; arc: string }[] = [
  { id: 'kpi-1', label: 'Total Courses', value: '23.940', tone: 'brand', icon: FiBookOpen, arc: '#8AD9C2' },
  { id: 'kpi-2', label: 'Courses Content', value: '32.567', tone: 'sun', icon: FiTrendingUp, arc: '#FED47B' },
  { id: 'kpi-3', label: 'Review', value: '94.230', tone: 'coral', icon: FiStar, arc: '#FD9C8D' },
];

export function AdminCourses() {
  const [range, setRange] = useState(RANGES[1]);

  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="space-y-5 xl:col-span-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {KPIS.map((kpi) => (
            <div
              key={kpi.id}
              className={`card-shadow relative flex items-center gap-4 overflow-hidden rounded-box p-5 text-white ${
                kpi.tone === 'brand' ? 'bg-brand' : kpi.tone === 'sun' ? 'bg-sun' : 'bg-coral'
              }`}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-lg">
                <kpi.icon aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold">{kpi.value}</span>
                <span className="block text-[11px] text-white/85">{kpi.label}</span>
              </span>
              <span
                aria-hidden
                className="absolute -right-4 top-1/2 size-16 -translate-y-1/2 rounded-full"
                style={{ background: `conic-gradient(#ffffff66 0 65%, transparent 65% 100%)` }}
              />
              <span
                aria-hidden
                className="absolute -right-1 top-1/2 size-10 -translate-y-1/2 rounded-full"
                style={{ backgroundColor: kpi.arc, opacity: 0.5 }}
              />
            </div>
          ))}
        </div>

        <Panel>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold sm:text-lg">Selling Activity</h2>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-1.5 text-[11px] text-muted sm:flex">
                <span className="size-2 rounded-full bg-brand" aria-hidden /> This Week
              </span>
              <span className="hidden items-center gap-1.5 text-[11px] text-muted sm:flex">
                <span className="size-2 rounded-full bg-sun" aria-hidden /> Last Week
              </span>
              <SegmentedControl options={RANGES} value={range} onChange={setRange} ariaLabel="Selling activity view" />
            </div>
          </div>
          <GroupedBar
            data={sellingActivity}
            xKey="week"
            layout="vertical"
            barSize={11}
            series={
              range === 'Selling'
                ? [{ key: 'selling', label: 'Selling', color: COLORS.brand }]
                : [{ key: 'insight', label: 'Insight', color: COLORS.sun }]
            }
            height={240}
          />
        </Panel>

        <Panel>
          <h2 className="mb-4 text-base font-semibold sm:text-lg">User Reviews</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {userReviews.map((review) => (
              <li key={review.id} className="rounded-field bg-base-200 p-4">
                <div className="flex items-center gap-3">
                  <img src={review.photo} alt={review.name} className="size-9 rounded-full object-cover" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">{review.name}</span>
                    <Rating value={review.rating} />
                  </span>
                </div>
                <p className="mt-3 text-[11px] leading-relaxed text-muted">{review.body}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold">Popular Class</h2>
            <KebabMenu label="Popular class options" />
          </div>
          <DonutChart data={popularClasses} innerRadius={66} outerRadius={96} height={230} />
          <ul className="mt-2 space-y-3">
            {popularClassRows.map((row) => (
              <li key={row.id}>
                <LegendRow label={row.label} value={row.value} color={row.color} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="mb-4 text-base font-semibold">Top Courses</h2>
          <ul className="space-y-3">
            {topCourses.map((course) => (
              <li
                key={course.id}
                className="flex items-center gap-3 rounded-field bg-base-200 p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-base-100 text-xs font-semibold text-brand">
                  {course.label.slice(-2)}
                </span>
                <span className="min-w-0 grow">
                  <span className="block truncate text-[11px] text-muted">{course.label}</span>
                  <span className="block text-sm font-semibold">{course.value}</span>
                </span>
                <span className="flex items-end gap-0.5" aria-hidden>
                  {[8, 14, 10, 18].map((height, index) => (
                    <span
                      key={index}
                      className={`w-1.5 rounded-full ${
                        course.tone === 'brand' ? 'bg-brand' : 'bg-sun'
                      }`}
                      style={{ height }}
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
