import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

type StepHeaderProps = {
  step: number;
  title: string;
  hint: string;
  /** Wire to the parent `<section aria-labelledby>`. */
  titleId?: string;
  action?: { label: string; to: string };
  className?: string;
};

/**
 * The page is a two-step chain — approve a level, then staff a class — so both
 * rosters carry the same numbered spine instead of two unrelated headings.
 */
export function StepHeader({
  step,
  title,
  hint,
  titleId,
  action,
  className = '',
}: StepHeaderProps) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-semibold tabular-nums text-base-100"
        >
          {step}
        </span>
        <div className="min-w-0">
          <h2 id={titleId} className="text-base font-semibold text-ink sm:text-lg">
            <span className="sr-only">Step {step}: </span>
            {title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted">{hint}</p>
        </div>
      </div>
      {action ? (
        <Link
          to={action.to}
          className="btn btn-ghost btn-sm mt-0.5 gap-1 rounded-full text-brand"
        >
          {action.label}
          <FiChevronRight aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}