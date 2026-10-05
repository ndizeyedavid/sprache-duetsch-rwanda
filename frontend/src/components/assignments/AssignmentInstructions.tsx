import { FiFileText } from 'react-icons/fi';
import type { AssignmentDetailData } from './types';
import { useShuffledOptions } from '../../hooks/useShuffledOptions';

export function AssignmentInstructions({ data }: { data: AssignmentDetailData }) {
  const config = (data.activity?.config ?? {}) as Record<string, unknown>;
  const options = useShuffledOptions(Array.isArray(config.options) ? config.options : [], data.activity?.id ?? 'instructions');
  const text = data.activity?.instructions ?? data.assessment?.description ?? String(config.prompt ?? config.question ?? 'Read each question carefully, then submit your work.');
  return (
    <section className="card learning-panel gap-4 p-5 sm:p-6">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><FiFileText aria-hidden />Instructions</h3>
      <p className="whitespace-pre-wrap text-sm leading-7 text-base-content/75">{text}</p>
      {config.sentence ? <p className="rounded-field border border-primary/10 bg-primary/5 p-4 text-sm leading-7">{String(config.sentence)}</p> : null}
      {Array.isArray(config.options) ? <ol className="grid gap-2 sm:grid-cols-2">{options.map(({ value: option, index }, position) => <li key={index} className="flex items-start gap-2 rounded-field border border-base-300/70 bg-base-100/70 p-3 text-xs leading-6"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-base-200 text-[10px] font-semibold">{String.fromCharCode(65 + position)}</span>{String(option)}</li>)}</ol> : null}
      <div className="mt-auto flex items-center gap-2 border-t border-base-300/70 pt-4 text-[11px] text-base-content/60"><span className="grid size-5 place-items-center rounded-full bg-base-200 text-[10px]">1</span>Read<span aria-hidden className="h-px flex-1 bg-base-300" /><span className="grid size-5 place-items-center rounded-full bg-base-200 text-[10px]">2</span>Complete<span aria-hidden className="h-px flex-1 bg-base-300" /><span className="grid size-5 place-items-center rounded-full bg-base-200 text-[10px]">3</span>Submit</div>
    </section>
  );
}
