import { useEffect,useRef,useState } from 'react';
import { FiCalendar,FiChevronDown } from 'react-icons/fi';
import { useIntakeScopeDetails } from './intake-context';
import { IntakePanel } from './IntakePanel';
import { PHASE_DOT,PHASE_LABEL } from './utils';

/** Header control: which intake every staff page is working in. */
export function IntakeSwitcher() {
  const { enabled, selected, intakes, loading } = useIntakeScopeDetails();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!enabled) return null;
  const label = selected ? selected.name : 'All intakes';
  const sub = selected ? PHASE_LABEL[selected.phase] : loading ? 'Loading…' : `${intakes.length} intakes`;

  return (
    <div ref={root} className="relative min-w-0">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="dialog"
        aria-label={`Intake: ${label}. Change intake`}
        className={`flex min-w-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-left ${selected ? 'border-primary bg-brand-tint' : 'border-line bg-base-100'} hover:border-primary`}>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-primary-content"><FiCalendar aria-hidden className="text-sm" /></span>
        <span className="min-w-0 leading-tight">
          <span className="block text-[0.625rem] font-semibold uppercase tracking-wider text-muted">Intake</span>
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="block max-w-[9rem] truncate text-xs font-semibold sm:max-w-[14rem]">{label}</span>
            {selected ? <span className={`size-2 shrink-0 rounded-full ${PHASE_DOT[selected.phase]}`} aria-hidden /> : null}
            <span className="hidden whitespace-nowrap text-[0.6875rem] text-muted xl:inline">{sub}</span>
          </span>
        </span>
        <FiChevronDown aria-hidden className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <IntakePanel onDone={() => setOpen(false)} /> : null}
    </div>
  );
}
