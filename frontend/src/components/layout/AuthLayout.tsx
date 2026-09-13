import { Link, Outlet } from "react-router-dom";
import { Logo } from "../ui/Logo";
import { portalLabel, portalLoginPath } from "../../lib/roles";
import type { Portal } from "../../lib/roles";

const COPY: Record<Portal, { heading: string; body: string; badge: string }> = {
  student: {
    badge: "Student portal",
    heading: "Deutsch lernen, Schritt für Schritt.",
    body: "Level-based courses A1 to B2, live evening classes, downloadable audio notes and progress you can track on any phone.",
  },
  teacher: {
    badge: "Teacher portal",
    heading: "Willkommen zurück, Lehrkraft.",
    body: "See your classes, mark attendance, grade work and keep in touch with your students — all in one place.",
  },
  staff: {
    badge: "Staff portal",
    heading: "One connected school.",
    body: "Manage students, academics, payments and certificates across every campus from a single dashboard.",
  },
};

const STATS: Record<Portal, { label: string; value: string }[]> = {
  student: [
    { label: "Levels", value: "A1–B2" },
    { label: "Campuses", value: "3" },
    { label: "Students", value: "1.2k" },
  ],
  teacher: [
    { label: "Live classes", value: "Daily" },
    { label: "Attendance", value: "Per session" },
    { label: "Grading", value: "Built in" },
  ],
  staff: [
    { label: "Campuses", value: "Multi" },
    { label: "Reports", value: "CSV" },
    { label: "Certificates", value: "Verified" },
  ],
};

const OTHER_PORTALS: Portal[] = ["student", "teacher", "staff"];

export function AuthLayout({ portal = "student" }: { portal?: Portal }) {
  const copy = COPY[portal];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-night p-10 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand/25 blur-3xl"
        />
        <Link to="/" className="relative">
          {/* <Logo size={44} withWordmark wordmarkClassName="text-white" /> */}
          <Logo size={130} />
        </Link>
        <div className="relative max-w-sm">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-brand">
            {copy.badge}
          </span>
          <h2 className="mt-4 text-3xl font-semibold leading-snug">
            {copy.heading}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            {copy.body}
          </p>
          <dl className="mt-8 grid grid-cols-3 gap-4">
            {STATS[portal].map((stat) => (
              <div key={stat.label}>
                <dt className="text-[11px] uppercase tracking-wide text-white/60">
                  {stat.label}
                </dt>
                <dd className="text-lg font-semibold">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <p className="relative text-xs text-white/50">
          © 2025 Deutsch Sprache RW
        </p>
      </div>

      <div className="flex items-center justify-center bg-base-200 px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 flex justify-center lg:hidden">
            <Logo size={40} withWordmark wordmarkClassName="text-ink" />
          </Link>
          <Outlet />

          <div className="mt-8 border-t border-line pt-4 text-center text-xs text-muted">
            <p className="font-medium text-ink">Looking for another portal?</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              {OTHER_PORTALS.filter((item) => item !== portal).map((item) => (
                <Link
                  key={item}
                  to={portalLoginPath[item]}
                  className="rounded-full border border-line bg-base-100 px-3 py-1 font-medium text-brand hover:border-brand"
                >
                  {portalLabel[item]} sign in
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
