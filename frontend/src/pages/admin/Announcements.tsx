import { useState } from "react";
import { FiPlus,FiVolume2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { AnnouncementComposer } from "../../components/admin/AnnouncementComposer";
import { NotificationDeliveries } from "../../components/admin/NotificationDeliveries";
import { WORKSPACE_CONTEXT } from "../../components/admin/workspace-context";
import { EmptyBlock,ErrorBlock,LoadingBlock } from "../../components/common/PageState";
import { heroAction,heroGhost } from "../../components/hero/hero-actions";
import { PageHero } from "../../components/hero/PageHero";
import { Modal } from "../../components/ui/Modal";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { useApi } from "../../hooks/useApi";
import { isoDate,listNotifications } from "../../lib/services";

const context = WORKSPACE_CONTEXT.announcements;

export function AdminAnnouncements() {
  const recent = useApi("announcements-recent", listNotifications);
  const [composing, setComposing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const items = (recent.data ?? []).filter((item) => item.type === "ANNOUNCEMENT");
  return (
    <div className="space-y-5">
      <PageHero eyebrow={context.category} icon={FiVolume2} title="Announcements" art="announcements"
        description="Share school news with learners, teachers or a single class, and check that every message arrived."
        meta={items.length ? <span className="hero-chip">{items.length} in your inbox</span> : null}
        actions={<>
          <button type="button" className={heroAction} onClick={() => { setSuccess(null); setComposing(true); }}><FiPlus aria-hidden />New announcement</button>
          {context.links.map((link) => <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>)}
        </>} />
      {success ? <p role="status" className="alert alert-success alert-soft text-xs">{success}</p> : null}
      <Panel>
        <SectionHeader title="Announcements in your inbox" />
        {recent.loading ? (
          <LoadingBlock label="Loading announcements…" />
        ) : recent.error ? (
          <ErrorBlock message={recent.error} onRetry={recent.refetch} />
        ) : !items.length ? (
          <EmptyBlock title="No announcements in your inbox" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="card border border-base-300 bg-base-100 p-5">
                <p className="text-[0.625rem] text-muted">{isoDate(item.createdAt)}</p>
                <h2 className="mt-2 text-base font-semibold">{item.title}</h2>
                <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        )}
        <NotificationDeliveries />
      </Panel>
      <Modal open={composing} onClose={() => setComposing(false)} title="New announcement" boxClassName="max-w-3xl">
        <AnnouncementComposer onSent={(count) => { recent.refetch(); setComposing(false); setSuccess(count ? `Announcement sent to ${count} member${count === 1 ? "" : "s"} — in the app and by email.` : "No members matched these filters, so nobody received it."); }} />
      </Modal>
    </div>
  );
}
