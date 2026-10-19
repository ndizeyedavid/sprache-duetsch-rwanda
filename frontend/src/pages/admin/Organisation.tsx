import { useState } from "react";
import { FiEdit2,FiMapPin,FiPhone,FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import { WORKSPACE_CONTEXT } from "../../components/admin/workspace-context";
import { heroAction,heroGhost } from "../../components/hero/hero-actions";
import { PageHero } from "../../components/hero/PageHero";
import { CampusEditorForm } from "../../components/admin/CampusEditorForm";
import {
EmptyBlock,
ErrorBlock,
LoadingBlock,
} from "../../components/common/PageState";
import { Modal } from "../../components/ui/Modal";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useApi } from "../../hooks/useApi";
import type { CampusItem } from "../../lib/services";
import { listCampusesFull } from "../../lib/services";

const context = WORKSPACE_CONTEXT.organisation;

export function AdminOrganisation() {
  const campuses = useApi("campuses-full", listCampusesFull);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CampusItem | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const rows = campuses.data ?? [];
  function edit(row: CampusItem | null) {
    setEditing(row);
    setOpen(true);
    setSuccess(null);
  }
  return (
    <div className="space-y-5">
      <PageHero eyebrow={context.category} icon={FiMapPin} title="Organisation" art="campus"
        description="Your campuses, addresses and contact details, as learners and staff see them across the school."
        meta={campuses.data ? <>
          <span className="hero-chip hero-chip-solid">{rows.length} {rows.length === 1 ? "campus" : "campuses"}</span>
          <span className="hero-chip">{rows.filter((c) => c.isActive).length} active</span>
          <span className="hero-chip">{rows.filter((c) => c.phone || c.email).length} with contact details</span>
        </> : null}
        actions={<>
          <button type="button" onClick={() => edit(null)} className={heroAction}><FiPlus aria-hidden />New campus</button>
          {context.links.map((link) => <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>)}
        </>} />
      <Panel>
        <SectionHeader title="Campuses" />
        {success && (
          <p
            role="status"
            className="alert alert-success alert-soft mb-4 text-xs"
          >
            {success}
          </p>
        )}
        {campuses.loading ? (
          <LoadingBlock label="Loading campuses…" />
        ) : campuses.error ? (
          <ErrorBlock message={campuses.error} onRetry={campuses.refetch} />
        ) : !rows.length ? (
          <EmptyBlock title="No campuses yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((c) => (
              <article
                key={c.id}
                className="card border border-base-300 bg-base-100 p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="grid size-10 place-items-center rounded-xl bg-base-200">
                    <FiMapPin aria-hidden />
                  </span>
                  <StatusBadge status={c.isActive ? "Active" : "Inactive"} />
                </div>
                <p className="mt-4 text-[0.625rem] uppercase tracking-wider text-muted">
                  {c.code}
                </p>
                <h3 className="mt-1 font-semibold">{c.name}</h3>
                {c.address && (
                  <p className="mt-2 text-xs text-muted">
                    {c.address}
                  </p>
                )}
                {c.phone && (
                  <p className="mt-3 flex items-center gap-2 text-xs">
                    <FiPhone aria-hidden />
                    {c.phone}
                  </p>
                )}
                {c.email && (
                  <p className="mt-2 break-all text-xs text-muted">
                    {c.email}
                  </p>
                )}
                <button
                  className="btn btn-sm mt-4 self-start rounded-full"
                  onClick={() => edit(c)}
                  aria-label={`Edit ${c.name}`}
                >
                  <FiEdit2 aria-hidden />
                  Edit
                </button>
              </article>
            ))}
          </div>
        )}
      </Panel>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit campus" : "New campus"}
      >
        <CampusEditorForm
          key={editing?.id ?? "new"}
          initial={editing}
          onSaved={() => {
            campuses.refetch();
            setOpen(false);
            setSuccess(editing ? "Campus updated." : "Campus created.");
          }}
        />
      </Modal>
    </div>
  );
}
