import { GroupedBar } from "../../components/charts/GroupedBar";
import {
EmptyBlock
} from "../../components/common/PageState";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { COLORS } from "../../lib/theme";
export function TeacherReportsSection5(props: { actDist: { bucket: string; count: number; color: string; }[]; actPer: { name: string; avg: number; count: number; }[] }) {
const { actDist, actPer } = props;
return (<div className="grid gap-4 lg:grid-cols-12">
            <Panel className="lg:col-span-6">
              <SectionHeader title="Activity scores" />
              {actDist.every((d) => d.count === 0) ? (
                <EmptyBlock title="No activity scores yet" />
              ) : (
                <GroupedBar
                  data={actDist.map((d) => ({ bucket: `Score ${d.bucket}`, count: d.count }))}
                  xKey="bucket"
                  series={[{ key: "count", label: "Students", color: COLORS.navy }]}
                  height={240}
                />
              )}
            </Panel>
            <Panel className="lg:col-span-6">
              <SectionHeader title="By activity" />
              {actPer.length === 0 ? (
                <EmptyBlock title="No activity data" hint="Grade activities to see averages." />
              ) : (
                <GroupedBar
                  data={actPer.map((a) => ({ name: a.name, avg: a.avg }))}
                  xKey="name"
                  series={[{ key: "avg", label: "Avg %", color: COLORS.brand }]}
                  height={240}
                  suffix="%"
                />
              )}
            </Panel>
          </div>);
}
