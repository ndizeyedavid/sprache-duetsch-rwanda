import { useState } from 'react';
import { FiChevronDown, FiUsers } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { SearchField } from '../../components/ui/SearchField';
import { KebabMenu } from '../../components/ui/KebabMenu';
import { Sparkline } from '../../components/charts/Sparkline';
import { LineTrend } from '../../components/charts/LineTrend';
import { COLORS } from '../../lib/theme';
import { adminDashboard, newUsersSpark, students, weekSeries } from '../../data/mock';

const PAGE_SIZE = 5;
const COLUMNS = ['Student ID', 'Courses', 'Join Date', 'Status'];

export function AdminStudents() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(true);

  const needle = query.trim().toLowerCase();
  const filtered = students
    .filter(
      (student) =>
        !needle ||
        student.name.toLowerCase().includes(needle) ||
        student.id.toLowerCase().includes(needle) ||
        student.course.toLowerCase().includes(needle),
    )
    .sort((a, b) => (sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const rows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = (safePage - 1) * PAGE_SIZE + rows.length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="card-shadow relative overflow-hidden rounded-box bg-brand p-5 text-white lg:col-span-3">
          <span className="inline-flex size-11 items-center justify-center rounded-xl bg-white/20 text-lg">
            <FiUsers aria-hidden />
          </span>
          <p className="mt-4 text-2xl font-semibold">
            {adminDashboard.totalStudents.toLocaleString('en-US').replace(',', '.')}
          </p>
          <p className="text-xs text-white/80">Total Students</p>
          <Sparkline
            data={newUsersSpark}
            color={COLORS.white}
            fill={COLORS.white}
            height={64}
            className="pointer-events-none absolute inset-x-0 bottom-0 opacity-40"
          />
        </div>

        <Panel className="lg:col-span-3">
          <h2 className="text-sm font-semibold">New Users</h2>
          <p className="mt-3 text-xl font-semibold">{adminDashboard.newUsers.toLocaleString('en-US')}</p>
          <p className="mt-1 text-[11px] font-medium text-brand">↑ +15%</p>
          <Sparkline data={newUsersSpark} color={COLORS.brand} height={52} className="mt-3" />
        </Panel>

        <Panel className="lg:col-span-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Students Activity</h2>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="size-2 rounded-full bg-sun" aria-hidden /> Last Week
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="size-2 rounded-full bg-brand" aria-hidden /> This Week
              </span>
              <KebabMenu label="Students activity options" />
            </div>
          </div>
          <LineTrend
            data={weekSeries}
            xKey="day"
            series={[
              { key: 'lastWeek', label: 'Last Week', color: COLORS.sun },
              { key: 'thisWeek', label: 'This Week', color: COLORS.brand },
            ]}
            height={210}
            showGrid={false}
          />
        </Panel>
      </div>

      <Panel>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold sm:text-lg">Students List</h2>
          <SearchField
            placeholder="Search"
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            ariaLabel="Search students"
            className="w-full sm:w-64"
          />
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[46rem] text-left">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th scope="col" className="py-3 pr-4 font-medium">
                  <button
                    type="button"
                    onClick={() => setSortAsc((current) => !current)}
                    className="inline-flex items-center gap-1 hover:text-ink"
                  >
                    Name
                    <FiChevronDown
                      className={sortAsc ? 'transition-transform' : 'rotate-180 transition-transform'}
                      aria-hidden
                    />
                  </button>
                </th>
                {COLUMNS.map((column) => (
                  <th key={column} scope="col" className="py-3 pr-4 font-medium">
                    {column}
                  </th>
                ))}
                <th scope="col" className="py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((student) => (
                <tr key={student.id} className="border-b border-line last:border-0">
                  <td className="py-3 pr-4">
                    <span className="flex items-center gap-3">
                      <img
                        src={student.photo}
                        alt={student.name}
                        loading="lazy"
                        className="size-9 rounded-full object-cover"
                      />
                      <span className="text-sm font-medium">{student.name}</span>
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-sm text-muted">{student.id}</td>
                  <td className="py-3 pr-4 text-sm text-muted">{student.course}</td>
                  <td className="py-3 pr-4 text-sm text-muted">{student.joinDate}</td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="py-3 text-right">
                    <KebabMenu label={`Actions for ${student.name}`} />
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted">
                    Keine Studierenden gefunden.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <Pagination page={safePage} pages={pages} from={from} to={to} total={filtered.length} onChange={setPage} />
      </Panel>
    </div>
  );
}
