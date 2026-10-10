import {
FiPlus
} from 'react-icons/fi';
import {
createModule
} from '../../lib/services';
import { EmptyBlock } from '../common/PageState';
import { Panel } from '../ui/Panel';
export function CurriculumManagerSection4(props: { moduleForm: { title: string; order: string; }; selectedLevelId: string | null; run: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>; setModuleForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; order: string; }>>; modules: import("../../hooks/useApi").ApiState<import("../../lib/services").ModuleItem[]>; busy: boolean }) {
const { moduleForm, selectedLevelId, run, setModuleForm, modules, busy } = props;
return (<Panel>
 <EmptyBlock title="No modules yet" hint="Create the first module below to start building this course." />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 const title = moduleForm.title.trim();
 if (!title || !selectedLevelId) return;
 void run(
 () => createModule(selectedLevelId, { title, order: Number(moduleForm.order) || 0, isPublished: true }),
 'Could not create the module.',
 () => {
 setModuleForm({ title: '', order: '' });
 modules.refetch();
 },
 );
 }}
 className="mx-auto mt-4 max-w-lg space-y-3"
 >
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Module title</span>
 <input required value={moduleForm.title} onChange={(e) => { const v = e.currentTarget.value; setModuleForm((f) => ({ ...f, title: v })) }} placeholder="e.g. Module 1: Foundations" className="input input w-full rounded-full border-line bg-base-200" />
 </label>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add module
  </button>
  </form>
  </Panel>);
}
