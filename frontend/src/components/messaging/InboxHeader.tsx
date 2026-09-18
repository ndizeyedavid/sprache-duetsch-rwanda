// import { FiEdit3 } from "react-icons/fi";
import { TABS } from "./constants";
import type { Tab } from "./constants";

type Props = {
  tab: Tab;
  onTab: (t: Tab) => void;
  unreadChats: number;
  unreadNotices: number;
  totalChats: number;
  totalNotices: number;
  onCompose: () => void;
};

export function InboxHeader({
  tab,
  onTab,
  unreadChats,
  unreadNotices,
  totalChats,
  totalNotices,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight">Inbox</h1>
        <div
          role="tablist"
          aria-label="Inbox sections"
          className="tabs tabs-boxed bg-base-200 p-1"
        >
          {TABS.map((name) => {
            const isChats = name === "Chats";
            const unread = isChats ? unreadChats : unreadNotices;
            const total = isChats ? totalChats : totalNotices;
            return (
              <button
                key={name}
                role="tab"
                aria-selected={tab === name}
                onClick={() => onTab(name as Tab)}
                className={`tab tab-sm gap-1.5 ${tab === name ? "tab-active bg-brand text-white" : ""}`}
              >
                {name}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${tab === name ? "bg-white/20 text-white" : unread ? "bg-brand text-white" : "bg-base-300"}`}
                >
                  {unread ? `${unread}` : `${total}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {/* <button type="button" onClick={onCompose} className="btn btn-sm gap-1.5 rounded-full border-0 bg-brand text-white hover:bg-brand/90">
        <FiEdit3 aria-hidden />Compose
      </button> */}
    </div>
  );
}
