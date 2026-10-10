import {
FiPlus
} from 'react-icons/fi';
import {
createModule
} from '../../lib/services';
import { Panel,SectionHeader } from '../ui/Panel';
export function CurriculumManagerSection3(props: { selectedLevelId: string | null; moduleForm: { title: string; order: string; }; run: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>; modules: import("../../hooks/useApi").ApiState<import("../../lib/services").ModuleItem[]>; setModuleForm: import("react").Dispatch<import("react").SetStateAction<{ title: string; order: string; }>>; busy: boolean }) {
const { selectedLevelId, moduleForm, run, modules, setModuleForm, busy } = props;
return (<Panel>
  <SectionHeader title="Add a module" />
 <form
 onSubmit={(e) => {
 e.preventDefault();
 if (!selectedLevelId) return;
 const title = moduleForm.title.trim();
 if (!title) return;
 void run(
 () => createModule(selectedLevelId, { title, order: (modules.data?.length ?? 0), isPublished: true }),
 'Could not create the module.',
 () => {
 setModuleForm({ title: '', order: '' });
 modules.refetch();
 },
 );
 }}
 className="space-y-3"
 >
 <label className="block">
 <span className="mb-1.5 block text-xs font-medium">Module title</span>
  <input
  required
  value={moduleForm.title}
  onChange={(e) => { const v = e.currentTarget.value; setModuleForm((f) => ({ ...f, title: v })) }}
  placeholder="e.g. Module 2: Everyday German"
  className="input input w-full rounded-full border-line bg-base-200"
  />
  </label>
  <button type="submit" disabled={busy} className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand hover:text-primary-content disabled:opacity-60">
  {busy ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />} Add module
  </button>
  </form>
  </Panel>);
}
