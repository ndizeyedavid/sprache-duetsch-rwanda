import { useState } from "react";
import { FiCheck, FiDroplet } from "react-icons/fi";
import { THEMES, getTheme, setTheme } from "../../lib/theme-store";
import type { ThemeId } from "../../lib/theme-store";

export function AppearancePane() {
 const [current, setCurrent] = useState<ThemeId>(getTheme());

 function pick(id: ThemeId) {
 setTheme(id);
 setCurrent(id);
 }

 return (
 <div className="space-y-4">
 <div className="rounded-box border border-line bg-base-200/30 p-3">
 <p className="flex items-center gap-2 text-xs font-semibold">
 <FiDroplet aria-hidden className="text-brand" />
 Appearance
 </p>
 <p className="mt-1 text-xs leading-snug text-muted">
 Pick a daisyUI theme — like Canvas display preferences. Saved on this
 device.
 </p>
 </div>

 <div className="grid gap-2 sm:grid-cols-2">
 {THEMES.map((t) => {
 const active = current === t.id;
 return (
 <button
 key={t.id}
 type="button"
 onClick={() => pick(t.id as ThemeId)}
 data-theme={t.id}
 aria-pressed={active}
 className={`flex items-center gap-3 rounded-box border p-3 text-left transition ${active ? "border-brand bg-brand-soft" : "border-line bg-base-100 hover:border-brand/20"}`}
 >
 <span className="flex gap-1">
 <span className="size-3 rounded-full bg-primary" />
 <span className="size-3 rounded-full bg-secondary" />
 <span className="size-3 rounded-full bg-accent" />
 <span className="size-3 rounded-full bg-base-300" />
 </span>
 <span className="min-w-0 grow">
 <span
 className={`block text-xs font-semibold ${active ? "text-[#B30A00]" : ""}`}
 >
 {t.label}
 </span>
 <span className="block text-[11px] text-muted">{t.hint}</span>
 </span>
 {active ? <FiCheck aria-hidden className="text-brand" /> : null}
 </button>
 );
 })}
 </div>
 </div>
 );
}
