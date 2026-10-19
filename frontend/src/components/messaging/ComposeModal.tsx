import { useMemo,useState } from "react";
import { FiEdit,FiSearch,FiX } from "react-icons/fi";
import type { Contact } from "../../lib/services";
import { humanize } from "../../lib/services";
import { Dialog } from "../ui/overlay/Dialog";
import { accentFor,initials } from "./utils";

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

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <Dialog open={open} onClose={onClose} busy={creating} icon={FiEdit} title="Start a conversation"
      subtitle="Select recipients — add a group name for group chats."
      footer={<>
        <span className="mr-auto text-xs text-muted">{selected.length} selected</span>
        <button type="button" disabled={creating} onClick={onClose} className="btn btn-ghost btn-sm rounded-full">Cancel</button>
        <button type="button" disabled={creating || selected.length === 0} onClick={() => onCreate(selected, title.trim() || undefined)} className="btn btn-primary btn-sm rounded-full">
          {creating ? <span className="loading loading-spinner loading-xs" /> : null}Start chat
        </button>
      </>}>
        <div className="space-y-3">
          <div className="relative">
            <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted" />
            <input aria-label="Search people" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search people…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-sm" />
            {q ? <button type="button" onClick={() => setQ("")} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
          </div>

          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {selected.map((id) => {
                const c = uniqueContacts.find((x) => x.id === id);
                if (!c) return null;
                return <span key={id} className="inline-flex items-center gap-1 rounded-full bg-base-200 px-2.5 py-1 text-xs font-medium">{c.firstName} {c.lastName}<button type="button" aria-label={`Remove ${c.firstName} ${c.lastName}`} onClick={() => toggle(id)} className="btn btn-ghost btn-xs btn-circle size-4 min-h-0 p-0"><FiX aria-hidden size="0.625rem" /></button></span>;
              })}
            </div>
          ) : null}

          {selected.length > 1 ? <input aria-label="Group name" maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Group name (optional)" className="input input-sm w-full rounded-full border-line bg-base-100 text-sm" /> : null}
        </div>

        <div className="mt-3">
          {loading ? <p className="py-10 text-center text-sm text-muted">Loading contacts…</p> : error ? <p className="rounded-box bg-error px-3 py-2 text-xs font-medium text-error-content">{error}</p> : filtered.length === 0 ? <p className="py-10 text-center text-sm text-muted">{contacts.length === 0 ? "No contacts yet. Your teachers and classmates appear when you’re enrolled." : "No matches."}</p> : (
            <ul className="space-y-1">
              {filtered.map((c) => {
                const active = selected.includes(c.id);
                return (
                  <li key={c.id}>
                    <button type="button" aria-pressed={active} disabled={creating || (!active && selected.length >= 20)} onClick={() => toggle(c.id)} className={`flex w-full items-center gap-3 rounded-box border p-3 text-left ${active ? "border-primary bg-brand-tint" : "border-line bg-base-100 hover:border-primary"}`}>
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

    </Dialog>
  );
}
