import { useState } from "react";
import { FiBookOpen,FiFileText,FiHelpCircle } from "react-icons/fi";
import { ResourceArticles } from "../../components/admin/ResourceArticles";
import { ResourceFaqs } from "../../components/admin/ResourceFaqs";
import { ResourceLibrary } from "../../components/admin/ResourceLibrary";

const SECTIONS = [
  {
    title: "Library",
    hint: "Find level materials and lessons",
    icon: FiBookOpen,
  },
  {
    title: "Articles",
    hint: "Publish stories and school updates",
    icon: FiFileText,
  },
  {
    title: "FAQs",
    hint: "Clear answers to common questions",
    icon: FiHelpCircle,
  },
] as const;
export function AdminResources() {
  const [section, setSection] = useState<string>("Library");
  return (
    <div className="space-y-5">
      <nav aria-label="Resource sections" className="grid gap-3 sm:grid-cols-3">
        {SECTIONS.map(({ title, hint, icon: Icon }) => (
          <button
            key={title}
            aria-pressed={section === title}
            onClick={() => setSection(title)}
            className={`card flex-row items-center gap-3 border p-4 text-left transition ${section === title ? "border-base-content bg-base-200" : "border-base-300 bg-base-100 hover:bg-base-200"}`}
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-base-200">
              <Icon aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold">{title}</span>
              <span className="mt-1 block text-xs text-muted">
                {hint}
              </span>
            </span>
          </button>
        ))}
      </nav>
      {section === "Library" ? (
        <ResourceLibrary />
      ) : section === "Articles" ? (
        <ResourceArticles isStaff />
      ) : (
        <ResourceFaqs isStaff />
      )}
    </div>
  );
}
