import { Link, Outlet } from "react-router-dom";
import { Logo } from "../ui/Logo";
const STATS = [
 { label: "Levels", value: "A1–B2" },
 { label: "Campuses", value: "3" },
 { label: "Students", value: "1.2k" },
];

export function AuthLayout() {
 return (
 <div className="grid min-h-screen lg:grid-cols-2">
 <div
 className="relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex"
 style={{
 background:
 "linear-gradient(rgba(0,0,0, 0.2), rgba(0,0,0,0.9)), url('/auth-image.webp')",
 backgroundSize: "cover",
 backgroundPosition: "center",
 backgroundRepeat: "no-repeat",
 }}
 >
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
 Deutsch Sprache RW
 </span>
 <h2 className="mt-4 text-3xl font-semibold leading-snug">
 One connected school.
 </h2>
 <p className="mt-3 text-sm leading-relaxed text-white/70">
 Learn, teach and manage your school in one place. Sign in with your account to access your dashboard.
 </p>
 <dl className="mt-8 grid grid-cols-3 gap-4">
 {STATS.map((stat) => (
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
 © 2026 Deutsch Sprache RW
 </p>
 </div>

 <div className="flex items-center justify-center bg-base-200 px-4 py-10 sm:px-8">
 <div className="w-full max-w-md">
 <Link to="/" className="mb-8 flex justify-center lg:hidden">
 <Logo size={40} withWordmark wordmarkClassName="text-ink" />
 </Link>
 <Outlet />


 </div>
 </div>
 </div>
 );
}
