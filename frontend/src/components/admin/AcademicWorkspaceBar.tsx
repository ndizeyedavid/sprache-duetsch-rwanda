import { FiArrowUpRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { WORKSPACE_CONTEXT } from "./workspace-context";

type Props = { pathname: string; title: string };
export function AcademicWorkspaceBar({ pathname, title }: Props) {
  const context = WORKSPACE_CONTEXT[pathname.split("/")[2]];
  if (!context || ["assignments", "attendance", "messages", "activity"].includes(pathname.split("/")[2])) return null;
  const Icon = context.icon;
  return (
    <header className="card mb-5 overflow-hidden border border-base-300 bg-base-100">
      <div className="flex items-center gap-4 p-5 sm:p-6">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.18em] text-muted">
            <Icon aria-hidden />
            {context.category}
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>

          <nav
            aria-label={`Related ${title.toLowerCase()} pages`}
            className="mt-4 flex flex-wrap gap-2"
          >
            {context.links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="btn btn-sm rounded-full border-base-300 bg-base-100 text-xs"
              >
                {link.label}
                <FiArrowUpRight aria-hidden />
              </Link>
            ))}
          </nav>
        </div>
        <img
          src={context.image}
          alt=""
          width={176}
          height={152}
          className="hidden h-24 w-32 shrink-0 object-contain sm:block"
        />
      </div>
    </header>
  );
}
