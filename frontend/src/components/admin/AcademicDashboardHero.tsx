import { FiArrowUpRight,FiCalendar,FiCompass } from "react-icons/fi";
import { Link } from "react-router-dom";
import { heroAction,heroGhost } from "../hero/hero-actions";
import { PageHero } from "../hero/PageHero";

type Props = { firstName?: string };

export function AcademicDashboardHero({ firstName }: Props) {
  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  return (
    <PageHero eyebrow="Academic overview" icon={FiCompass} art="team" scoped
      title={`Willkommen${firstName ? `, ${firstName}` : ""}.`}
      description={`${today} — learners, classes and follow-ups for your school at a glance.`}
      actions={<>
        <Link to="/admin/students" className={heroAction}>View learners <FiArrowUpRight aria-hidden /></Link>
        <Link to="/admin/schedule" className={heroGhost}><FiCalendar aria-hidden />Plan classes</Link>
      </>} />
  );
}
