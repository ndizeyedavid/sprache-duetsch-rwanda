import { FiBell, FiAward, FiClock } from "react-icons/fi";

type Props = { total: number; announcements: number; recent: number };

export function ActivityStats({ total, announcements, recent }: Props) {
  const cards = [
    { label: "Total updates", value: total, sub: "All time", icon: FiClock, tone: "bg-brand text-white" },
    { label: "Announcements", value: announcements, sub: "From teachers", icon: FiBell, tone: "bg-info text-white" },
    { label: "Recent", value: recent, sub: "Last 7 days", icon: FiAward, tone: "bg-success text-white" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-box border border-line bg-base-100 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted">{c.label}</p>
            <span className={`flex size-7 items-center justify-center rounded-full text-xs ${c.tone}`}>
              <c.icon aria-hidden size={14} />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold">{c.value}</p>
          <p className="text-xs text-muted">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
