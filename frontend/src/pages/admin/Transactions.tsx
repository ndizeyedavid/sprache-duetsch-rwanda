import { FiDownload } from "react-icons/fi";
import { Panel } from "../../components/ui/Panel";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { LegendRow } from "../../components/ui/LegendRow";
import { GroupedBar } from "../../components/charts/GroupedBar";
import { DonutChart } from "../../components/charts/DonutChart";
import { COLORS } from "../../lib/theme";
import { rwf } from "../../lib/format";
import {
  monthlySeries,
  popularClassRows,
  popularClasses,
  transactions,
} from "../../data/mock";

const COLUMNS = ["Date", "Name", "Amount", "Status", "Invoice"];
const TOTAL_ORDER = 317642;

export function AdminTransactions() {
  return (
    <div className="grid gap-5 xl:grid-cols-12">
      <div className="space-y-5 xl:col-span-8">
        <Panel>
          <div className="grid gap-5 lg:grid-cols-[9.5rem_1fr]">
            <div>
              <h2 className="text-base font-semibold">Earnings</h2>
              <p className="mt-1 text-[11px] text-muted">
                Dec 1 – Dec 31, 2025
              </p>
              <p className="mt-5 text-[11px] text-muted">This Month</p>
              <p className="text-xl font-semibold">{rwf(53678)}</p>
              <p className="mt-1 text-[11px] font-medium text-brand">↑ +15%</p>
            </div>
            <GroupedBar
              data={monthlySeries}
              xKey="month"
              barSize={9}
              height={240}
              series={[
                { key: "thisWeek", label: "This Year", color: COLORS.brand },
                { key: "lastWeek", label: "Last Year", color: COLORS.sun },
              ]}
            />
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold sm:text-lg">
              Lastest Transaction
            </h2>
            <button
              type="button"
              className="text-xs font-medium text-muted hover:text-ink"
            >
              View all
            </button>
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[44rem] text-left">
              <thead>
                <tr className="border-b border-line text-xs text-muted">
                  {COLUMNS.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="py-3 pr-4 font-medium"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="py-3 pr-4 text-sm text-muted">
                      {transaction.date}
                    </td>
                    <td className="py-3 pr-4 text-sm font-medium">
                      {transaction.name}
                    </td>
                    <td className="py-3 pr-4 text-sm font-semibold">
                      {rwf(transaction.amount)}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={transaction.status} />
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"
                      >
                        Download
                        <FiDownload aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <div className="space-y-5 xl:col-span-4">
        <Panel>
          <h2 className="text-base font-semibold">Total Order</h2>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-2xl font-semibold">
              {TOTAL_ORDER.toLocaleString("en-US").replace(",", ".")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-[#2F8F73]">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              +50%
            </span>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Alle bestätigten Zahlungen aus MoMo, Airtel Money, Bank und Karte
            für alle Standorte.
          </p>
        </Panel>

        <Panel>
          <h2 className="text-base font-semibold">Earning Courses</h2>
          <p className="mt-2 text-[11px] text-muted">This Month</p>
          <p className="text-xl font-semibold">{rwf(53678)}</p>
          <DonutChart
            data={popularClasses}
            innerRadius={66}
            outerRadius={96}
            height={220}
          />
          <ul className="space-y-3">
            {popularClassRows.map((row) => (
              <li key={row.id}>
                <LegendRow
                  label={row.label}
                  value={row.value}
                  color={row.color}
                />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
