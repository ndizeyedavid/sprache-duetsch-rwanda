import { useState } from 'react';
import { FiAward,FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { ExamLevel } from '../../components/exams/ExamLevel';
import { PageHero } from '../../components/hero/PageHero';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { getMyExamCentre } from '../../lib/services/exam-centre';

/** Exam preparation: for each paid course, how its Goethe exam works, our tests in that format and official sample papers. */
export function Exams() {
  const centre = useApi('my-exam-centre', getMyExamCentre);
  const levels = centre.data?.levels ?? [];
  const locked = centre.data?.locked ?? [];
  const [picked, setPicked] = useState<string | null>(null);
  const current = levels.find((level) => level.code === (picked ?? centre.data?.currentLevelCode)) ?? levels.at(-1) ?? null;
  const tabs = levels.length > 1 ? (
    <nav aria-label="Course" className="flex flex-wrap gap-2">
      {levels.map((level) => (
        <button key={level.code} type="button" aria-pressed={current?.code === level.code} onClick={() => setPicked(level.code)}
          className={`btn btn-sm rounded-full ${current?.code === level.code ? 'btn-primary' : ''}`}>{level.code} · {level.title}</button>
      ))}
    </nav>
  ) : undefined;
  const hero = <PageHero eyebrow="Exam preparation" icon={FiAward} title="Prüfungstraining · Exam prep" art="placement" footer={tabs}
    description="Get ready for the Goethe exam: how it works, our module tests and mock exam in the same format, and official sample papers to download." />;

  if (centre.loading) return <div className="space-y-4">{hero}<LoadingBlock label="Loading your exam centre…" /></div>;
  if (centre.error) return <div className="space-y-4">{hero}<ErrorBlock message={centre.error} onRetry={centre.refetch} /></div>;
  return (
    <div className="space-y-4">
      {hero}
      {locked.length ? <p className="flex flex-wrap items-center gap-2 rounded-box border border-base-300 bg-base-100 p-3 text-sm">
        <FiLock aria-hidden />Finish paying for {locked.map((level) => level.code).join(', ')} to unlock its exam papers and tests.
        <Link to="/payments" className="btn btn-xs rounded-full">Payments</Link>
      </p> : null}
      {current ? <ExamLevel key={current.code} level={current} />
        : <Panel><EmptyBlock title="No course yet" hint="When your course is active, its exam guide, tests and sample papers appear here." /></Panel>}
    </div>
  );
}
