import { AcademicModalAction } from "../../components/admin/AcademicModalAction";
import { AnnouncementComposer } from "../../components/admin/AnnouncementComposer";
import { NotificationDeliveries } from "../../components/admin/NotificationDeliveries";
import {
EmptyBlock,
ErrorBlock,
LoadingBlock,
} from "../../components/common/PageState";
import { Panel,SectionHeader } from "../../components/ui/Panel";
import { useApi } from "../../hooks/useApi";
import { isoDate,listNotifications } from "../../lib/services";

export function AdminAnnouncements() {
  const recent = useApi("announcements-recent", listNotifications);
  const items = (recent.data ?? []).filter(
    (item) => item.type === "ANNOUNCEMENT",
  );
  return (
    <Panel>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <SectionHeader title="Announcements in your inbox" className="mb-0" />
        <AcademicModalAction
          label="New announcement"
          title="New announcement"
          wide
        >
          {(done) => (
            <AnnouncementComposer
              onSent={() => {
                recent.refetch();
                done("Announcement sent.");
              }}
            />
          )}
        </AcademicModalAction>
      </div>
      {recent.loading ? (
        <LoadingBlock label="Loading announcements…" />
      ) : recent.error ? (
        <ErrorBlock message={recent.error} onRetry={recent.refetch} />
      ) : !items.length ? (
        <EmptyBlock title="No announcements in your inbox" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.id}
              className="card border border-base-300/70 bg-base-100 p-5"
            >
              <p className="text-[10px] text-base-content/50">
                {isoDate(item.createdAt)}
              </p>
              <h2 className="mt-2 text-base font-semibold">{item.title}</h2>
              <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-base-content/65">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      )}
      <NotificationDeliveries />
    </Panel>
  );
}
