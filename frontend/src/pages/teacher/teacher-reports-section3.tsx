import { FiTrendingUp } from "react-icons/fi";
import { GroupedBar } from "../../components/charts/GroupedBar";
import {
EmptyBlock
} from "../../components/common/PageState";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { COLORS } from "../../lib/theme";
export function TeacherReportsSection3(props: { dist: { bucket: string; count: number; color: string; }[]; perAss: { name: string; avg: number; pass: number; }[] }) {
const { dist, perAss } = props;
return (<div className="grid gap-4 lg:grid-cols-12">
            <Panel className="lg:col-span-6">
              <SectionHeader title="Grade distribution — exams" />
              {dist.every((d) => d.count === 0) ? (
                <EmptyBlock title="No graded scores yet" />
              ) : (
                <GroupedBar
                  data={dist.map((d) => ({ bucket: d.bucket, count: d.count }))}
                  xKey="bucket"
                  series={[
                    { key: "count", label: "Students", color: COLORS.navy },
                  ]}
                  height={240}
                />
              )}
            </Panel>
            <Panel className="lg:col-span-6">
              <SectionHeader title="By assessment" />
              {perAss.length === 0 ? (
                <EmptyBlock
                  title="No assessment data"
                  hint="Pick All assessments or a wider date."
                />
              ) : (
                <GroupedBar
                  data={perAss.map((a) => ({ name: a.name, avg: a.avg }))}
                  xKey="name"
                  series={[{ key: "avg", label: "Avg %", color: COLORS.sun }]}
                  height={240}
                  suffix="%"
                />
              )}
              {perAss.length ? (
                <p className="mt-2 text-[11px] text-muted">
                  <FiTrendingUp aria-hidden className="inline" /> Pass rate
                  shown on hover —{" "}
                  <span className="font-mono">
                    {perAss.map((a) => `${a.name}: ${a.pass}%`).join(" · ")}
                  </span>
                </p>
              ) : null}
            </Panel>
          </div>);
}
