import { useState } from "react";
import { FiBookOpen,FiFileText,FiHelpCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { ResourceArticles } from "../../components/admin/ResourceArticles";
import { ResourceFaqs } from "../../components/admin/ResourceFaqs";
import { ResourceLibrary } from "../../components/admin/ResourceLibrary";
import { WORKSPACE_CONTEXT } from "../../components/admin/workspace-context";
import { heroGhost } from "../../components/hero/hero-actions";
import { PageHero } from "../../components/hero/PageHero";

const SECTIONS = [
  { title: "Library", hint: "Find level materials and lessons", icon: FiBookOpen },
  { title: "Articles", hint: "Publish stories and school updates", icon: FiFileText },
  { title: "FAQs", hint: "Clear answers to common questions", icon: FiHelpCircle },
] as const;
const context = WORKSPACE_CONTEXT.resources;

export function AdminResources() {
  const [section, setSection] = useState<string>("Library");
  const sections = (
    <nav aria-label="Resource sections" className="grid gap-2 sm:grid-cols-3">
      {SECTIONS.map(({ title, hint, icon: Icon }) => (
        <button key={title} type="button" aria-pressed={section === title} onClick={() => setSection(title)}
          className={`flex items-center gap-3 rounded-box border px-3 py-2.5 text-left transition ${section === title ? "border-base-content bg-base-200" : "border-base-300 bg-base-100 hover:bg-base-200"}`}>
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-base-200"><Icon aria-hidden /></span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{title}</span>
            <span className="mt-0.5 block text-xs text-muted">{hint}</span>
          </span>
        </button>
      ))}
    </nav>
  );
  return (
    <div className="space-y-5">
      <PageHero eyebrow={context.category} icon={context.icon} title="Resources" art="notes" footer={sections}
        description="Lesson materials, articles and answers to common questions, gathered in one library for every level."
        actions={context.links.map((link) => <Link key={link.to} to={link.to} className={heroGhost}>{link.label}</Link>)} />
      {section === "Library" ? <ResourceLibrary /> : section === "Articles" ? <ResourceArticles isStaff /> : <ResourceFaqs isStaff />}
    </div>
  );
}
