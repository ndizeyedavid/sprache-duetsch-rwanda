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
  success: "bg-success text-success-content",
  warning: "bg-warning text-warning-content text-base-content",
  info: "bg-info text-info-content",
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
      className={`card text-left min-w-0 border border-base-300 bg-base-100 p-4 sm:p-5 ${onClick ? "transition hover:bg-base-200" : ""} ${pressed ? "ring-2 ring-base-content" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted">{label}</p>
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
        <p className="mt-2 text-xs leading-5 text-muted">{note}</p>
      )}
    </Element>
  );
}
