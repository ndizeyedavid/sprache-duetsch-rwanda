import { FiArrowUpRight,FiCalendar } from "react-icons/fi";
import { Link } from "react-router-dom";

type Props = { firstName?: string };

export function AcademicDashboardHero({ firstName }: Props) {
  return (
    <section className="card overflow-hidden border border-base-300 bg-base-100 lg:grid lg:grid-cols-[1.15fr_1fr]">
      <div className="flex flex-col justify-center p-6 sm:p-8">
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-muted">
          <span className="size-2 rounded-full bg-success" />
          Academic overview
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Welcome back{firstName ? `, ${firstName}` : ""}.
        </h1>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/admin/students"
            className="btn btn-primary btn-sm rounded-full px-5"
          >
            View learners
            <FiArrowUpRight aria-hidden />
          </Link>
          <Link to="/admin/schedule" className="btn btn-sm rounded-full">
            <FiCalendar aria-hidden />
            Plan classes
          </Link>
        </div>
      </div>
      <figure className="relative aspect-[1000/667] bg-[#fcf3df]">
        <img
          src="/illustrations/academic-planning.webp"
          alt="Two educators planning lessons together with books and a laptop"
          width={1000}
          height={667}
          className="absolute inset-0 h-full w-full object-contain"
          fetchPriority="high"
        />
      </figure>
    </section>
  );
}
