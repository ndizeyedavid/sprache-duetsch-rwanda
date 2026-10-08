import { AreaTrend } from "../../components/charts/AreaTrend";
import { DonutChart } from "../../components/charts/DonutChart";
import {
EmptyBlock
} from "../../components/common/PageState";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { COLORS } from "../../lib/theme";
export function TeacherReportsSection2(props: { trend: { week: string; avg: number; }[]; pending: number; graded: number; total: number }) {
const { trend, pending, graded, total } = props;
return (<div className="grid gap-4 lg:grid-cols-12">
            <Panel className="lg:col-span-8">
              <SectionHeader title="Performance trend — exams" />
              {trend.length === 0 ? (
                <EmptyBlock
                  title="Not enough graded data"
                  hint="Trend appears once you have graded submissions in this period."
                />
              ) : (
                <AreaTrend
                  data={trend as never}
                  xKey="week"
                  series={[{ key: "avg", label: "Avg %", color: COLORS.brand }]}
                  suffix="%"
                />
              )}
              <p className="mt-2 text-[11px] text-muted">Weekly average of graded exam scores.</p>
            </Panel>
            <Panel className="lg:col-span-4">
              <SectionHeader title="Exam status" />
              {(() => {
                const sub = pending;
                const grd = graded;
                const prog = total - sub - grd;
                const data = [
                  { name: "Graded", value: grd, color: COLORS.brand },
                  { name: "Pending", value: sub, color: COLORS.coral },
                  { name: "In progress", value: prog, color: COLORS.muted },
                ].filter((d) => d.value > 0);
                if (!data.length)
                  return <EmptyBlock title="No submissions in range" />;
                return (
                  <DonutChart data={data} suffix="">
                    <span className="text-lg font-bold">{total}</span>
                    <span className="text-[11px] text-muted">total</span>
                  </DonutChart>
                );
              })()}
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-brand-soft px-2 py-1 text-[#B30A00]">
                  Graded {graded}
                </span>
                <span className="rounded-full bg-coral-soft px-2 py-1 text-[#D8482F]">
                  Pending {pending}
                </span>
              </div>
            </Panel>
          </div>);
}
