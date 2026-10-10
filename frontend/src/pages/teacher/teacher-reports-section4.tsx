import { AreaTrend } from "../../components/charts/AreaTrend";
import { GroupedBar } from "../../components/charts/GroupedBar";
import {
EmptyBlock
} from "../../components/common/PageState";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { COLORS } from "../../lib/theme";
export function TeacherReportsSection4(props: { actTrend: { date: string; avg: number; count: number; }[]; actDist: { bucket: string; count: number; color: string; }[] }) {
const { actTrend, actDist } = props;
return (<div className="grid gap-4 lg:grid-cols-12">
            <Panel className="lg:col-span-8">
              <SectionHeader title="Activity trend" />
              {actTrend.length === 0 ? (
                <EmptyBlock title="No graded activity data" hint="Trend appears once activities are graded." />
              ) : (
                <AreaTrend
                  data={actTrend as never}
                  xKey="date"
                  series={[{ key: "avg", label: "Avg %", color: COLORS.navy }]}
                  suffix="%"
                />
              )}
              <p className="mt-2 text-[11px] text-muted">Weekly average score for lesson activities (0-1 scaled to %).</p>
            </Panel>
            <Panel className="lg:col-span-4">
              <SectionHeader title="Activity scores" />
              {actDist.every((d) => d.count === 0) ? (
                <EmptyBlock title="No graded activities yet" />
              ) : (
                <GroupedBar
                  data={actDist.map((d) => ({ bucket: d.bucket, count: d.count }))}
                  xKey="bucket"
                  series={[{ key: "count", label: "Students", color: COLORS.navy }]}
                  height={240}
                />
              )}
            </Panel>
          </div>);
}
