import type { IconType } from "react-icons";
import { FiActivity,FiCheckCircle,FiLayers,FiUsers } from "react-icons/fi";
import { AcademicMetricCard } from "./AcademicMetricCard";

type Item = {
  label: string;
  value: string | number;
  note: string;
  icon?: IconType;
};
const icons = [FiLayers, FiCheckCircle, FiUsers, FiActivity];
export function AcademicSummary({ items }: { items: Item[] }) {
  return (
    <section
      aria-label="Page summary"
      className={`grid grid-cols-2 gap-3 ${items.length === 3 ? "lg:grid-cols-3" : "xl:grid-cols-4"}`}
    >
      {items.map((item, index) => (
        <AcademicMetricCard
          key={item.label}
          {...item}
          icon={item.icon ?? icons[index % icons.length]}
          tone={index === 1 ? "success" : index === 2 ? "info" : "neutral"}
        />
      ))}
    </section>
  );
}
