import { FiChevronDown, FiShield } from 'react-icons/fi';

export function AssignmentRules() {
  return (
    <details className="group rounded-field border border-base-300/70 bg-base-200/50 p-3">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium"><FiShield aria-hidden />Protected assignment<FiChevronDown aria-hidden className="ml-auto transition-transform group-open:rotate-180" /></summary>
      <p className="mt-2 text-[11px] leading-6 text-base-content/65">Fullscreen is required. Three violations lock your work for teacher review.</p>
      <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px] leading-6 text-base-content/65"><li>Stay in fullscreen and on this tab.</li><li>Copy, cut, paste, right-click, drag, select-all, and PrintScreen are blocked.</li><li>Switching tabs or windows counts as a violation.</li><li>A locked assessment is automatically submitted.</li></ul>
    </details>
  );
}
