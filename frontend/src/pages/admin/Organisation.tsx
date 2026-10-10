import { useState } from "react";
import { FiEdit2,FiMapPin,FiPhone,FiPlus } from "react-icons/fi";
import { AcademicSummary } from "../../components/admin/AcademicSummary";
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
      {campuses.data && (
        <AcademicSummary
          items={[
            { label: "Campuses", value: rows.length, note: "School locations" },
            {
              label: "Active",
              value: rows.filter((c) => c.isActive).length,
              note: "Available campuses",
            },
            {
              label: "With contact details",
              value: rows.filter((c) => c.phone || c.email).length,
              note: "Phone or email available",
            },
          ]}
        />
      )}
      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <SectionHeader title="Campuses" className="mb-0" />
          <button
            onClick={() => edit(null)}
            className="btn btn-primary btn-sm rounded-full"
          >
            <FiPlus aria-hidden />
            New campus
          </button>
        </div>
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
                <p className="mt-4 text-[10px] uppercase tracking-wider text-muted">
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
