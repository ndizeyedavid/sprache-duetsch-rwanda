import type { IconType } from "react-icons";

type Props = {
  label: string;
  value: string | number;
  note?: string;
  icon: IconType;
  onClick?: () => void;
  pressed?: boolean;
  tone?: "neutral" | "success" | "warning" | "info";
};
const tones = {
  neutral: "bg-base-200 text-base-content",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-base-content",
  info: "bg-info/10 text-info",
};

export function AcademicMetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone = "neutral",
  onClick,
  pressed,
}: Props) {
  const Element = onClick ? "button" : "div";
  return (
    <Element
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-pressed={pressed}
      className={`card text-left min-w-0 border border-base-300/70 bg-base-100 p-4 sm:p-5 ${onClick ? "transition hover:bg-base-200/60" : ""} ${pressed ? "ring-2 ring-base-content/30" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-base-content/65">{label}</p>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${tones[tone]}`}
        >
          <Icon aria-hidden size={18} />
        </span>
      </div>
      <p className="mt-3 break-words text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
        {value}
      </p>
      {note && (
        <p className="mt-2 text-xs leading-5 text-base-content/55">{note}</p>
      )}
    </Element>
  );
}
