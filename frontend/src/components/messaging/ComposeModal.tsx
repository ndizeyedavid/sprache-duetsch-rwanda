import { useMemo, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { humanize } from "../../lib/services";
import { initials, accentFor } from "./utils";
import type { Contact } from "../../lib/services";

type Props = { open: boolean; onClose: () => void; contacts: Contact[]; loading: boolean; error: string | null; onCreate: (ids: string[], title?: string) => void; creating: boolean };

export function ComposeModal({ open, onClose, contacts, loading, error, onCreate, creating }: Props) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState("");

  const uniqueContacts = useMemo(() => { const seen = new Set<string>(); return contacts.filter((c) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; }); }, [contacts]);
  const filtered = useMemo(() => {
    if (!q.trim()) return uniqueContacts;
    const needle = q.trim().toLowerCase();
    return uniqueContacts.filter((c) => `${c.firstName} ${c.lastName} ${c.role}`.toLowerCase().includes(needle));
  }, [uniqueContacts, q]);

  if (!open) return null;

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative flex max-h-[86vh] w-full max-w-lg flex-col overflow-hidden rounded-box bg-base-100 shadow-xl">
        <div className="border-b border-line px-5 py-4 pr-12">
          <h3 className="text-sm font-bold">New message</h3>
          <p className="mt-1 text-xs text-muted">Select recipients — add a group name for group chats.</p>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3"><FiX aria-hidden /></button>
        </div>

        <div className="space-y-3 p-4">
          <div className="relative">
            <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-sm" />
            {q ? <button type="button" onClick={() => setQ("")} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
          </div>

          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((id) => {
                const c = uniqueContacts.find((x) => x.id === id);
                if (!c) return null;
                return <span key={id} className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium">{c.firstName} {c.lastName}<button type="button" onClick={() => toggle(id)} className="btn btn-ghost btn-xs btn-circle size-4 min-h-0 p-0"><FiX aria-hidden size={10} /></button></span>;
              })}
            </div>
          ) : null}

          {selected.length > 1 ? <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Group name (optional)" className="input input-sm w-full rounded-full border-line bg-base-100 text-sm" /> : null}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading ? <p className="py-10 text-center text-sm text-muted">Loading contacts…</p> : error ? <p className="rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]">{error}</p> : filtered.length === 0 ? <p className="py-10 text-center text-sm text-muted">{contacts.length === 0 ? "No contacts yet." : "No matches."}</p> : (
            <ul className="space-y-1">
              {filtered.map((c) => {
                const active = selected.includes(c.id);
                return (
                  <li key={c.id}>
                    <button type="button" onClick={() => toggle(c.id)} className={`flex w-full items-center gap-3 rounded-box border p-3 text-left ${active ? "border-brand bg-brand-soft" : "border-line bg-base-100 hover:border-brand/20"}`}>
                      <span className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${accentFor(c.firstName)}`}>{initials(c.firstName, c.lastName)}</span>
                      <span className="min-w-0 grow"><span className="block truncate text-sm font-semibold">{c.firstName} {c.lastName}</span><span className="block truncate text-xs text-muted">{humanize(c.role)}</span></span>
                      <span className={`checkbox checkbox-sm ${active ? "checkbox-primary" : ""}`} aria-hidden>{active ? "✓" : ""}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-base-200/30 px-4 py-3">
          <span className="text-xs text-muted">{selected.length} selected</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-sm rounded-full border-line bg-base-100">Cancel</button>
            <button type="button" disabled={creating || selected.length === 0} onClick={() => onCreate(selected, title.trim() || undefined)} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60">
              {creating ? <span className="loading loading-spinner loading-xs" /> : null}Start chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
