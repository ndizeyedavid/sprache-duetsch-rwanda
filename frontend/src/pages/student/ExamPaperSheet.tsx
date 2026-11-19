import { useEffect,useState } from 'react';
import { FiArrowLeft,FiBookOpen,FiCheckSquare,FiExternalLink,FiHeadphones,FiRotateCcw } from 'react-icons/fi';
import { Link,useParams } from 'react-router-dom';
import { ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { AnswerSheet } from '../../components/exams/AnswerSheet';
import { PaperAudioList } from '../../components/exams/PaperAudioList';
import { SheetHistory } from '../../components/exams/SheetHistory';
import { heroGhost } from '../../components/hero/hero-actions';
import { PageHero } from '../../components/hero/PageHero';
import { openMaterial } from '../../components/student/materialFiles';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { checkMyPaperSheet,getMyPaperSheet } from '../../lib/services/exam-centre';
import type { SheetMark } from '../../lib/services/exam-centre';

type Responses = (string | null)[][];
const readSaved = (key: string): Responses => { try { return JSON.parse(localStorage.getItem(key) ?? '[]') as Responses; } catch { return []; } };

/** Online answer sheet for an official sample exam: tick the answers from the PDF, then check them. */
export function ExamPaperSheet() {
  const { id = '' } = useParams();
  const sheet = useApi(`paper-sheet-${id}`, () => getMyPaperSheet(id), Boolean(id));
  const storageKey = `exam-sheet:${id}`;
  const [responses, setResponses] = useState<Responses>(() => readSaved(storageKey));
  const [mark, setMark] = useState<SheetMark | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Unchecked answers survive a reload; once checked, the result is saved on the server instead.
  useEffect(() => { if (!mark) localStorage.setItem(storageKey, JSON.stringify(responses)); }, [storageKey, responses, mark]);

  const parts = sheet.data?.parts ?? [];
  const audio = sheet.data?.audio ?? [];
  const fileUrl = sheet.data?.fileUrl ?? null;
  const total = parts.reduce((sum, part) => sum + part.count, 0);
  const answered = parts.reduce((sum, part, at) => sum + (responses[at] ?? []).slice(0, part.count).filter(Boolean).length, 0);
  function choose(part: number, item: number, value: string) {
    setResponses((previous) => parts.map((entry, at) => Array.from({ length: entry.count }, (_, index) => at === part && index === item ? value : previous[at]?.[index] ?? null)));
  }
  async function check() {
    setChecking(true); setError(null);
    try {
      setMark(await checkMyPaperSheet(id, parts.map((part, at) => Array.from({ length: part.count }, (_, index) => responses[at]?.[index] ?? null))));
      localStorage.removeItem(storageKey);
      sheet.refetch();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    catch (e) { setError(apiErrorMessage(e, 'Could not check your answers. Try again.')); }
    finally { setChecking(false); }
  }
  function restart() { setMark(null); setResponses([]); }

  const hero = <PageHero compact eyebrow={`${sheet.data?.level.code ?? ''} · Answer sheet`} icon={FiCheckSquare} title={sheet.data?.title ?? 'Answer sheet'} art="placement"
    description="Open the PDF, do the reading and listening parts, tick your answers here, then press Check. Every check is saved, so you can see your progress."
    actions={<>
      <Link to="/exams" className={heroGhost}><FiArrowLeft aria-hidden />Exam prep</Link>
      {fileUrl ? <button type="button" onClick={() => void openMaterial(fileUrl, sheet.data?.title ?? 'Exam paper').catch(() => setError('Could not open the PDF. Check your connection and try again.'))}
        className={heroGhost}><FiBookOpen aria-hidden />Open the PDF</button> : null}
      {sheet.data?.sourceUrl ? <a href={sheet.data.sourceUrl} target="_blank" rel="noreferrer" className={heroGhost}>
        <FiExternalLink aria-hidden />{audio.length ? 'Official page' : 'Audio & official page'}</a> : null}
    </>} />;
  if (sheet.loading) return <div className="space-y-4">{hero}<LoadingBlock label="Loading the answer sheet…" /></div>;
  if (sheet.error || !sheet.data) return <div className="space-y-4">{hero}<ErrorBlock message={sheet.error ?? 'This paper has no answer sheet.'} onRetry={sheet.refetch} /></div>;
  return (
    <div className="space-y-4">
      {hero}
      {mark ? <section className="card border border-base-300 bg-base-100 p-4 sm:p-5" aria-live="polite">
        <p className="text-2xl font-bold">{mark.score}/{mark.total} · {mark.percentage}%</p>
        <p className="text-sm text-muted">{mark.sections.map((section) => `${section.name} ${section.score}/${section.total}`).join(' · ')} · The exam needs 60% to pass.</p>
        <p className="mt-2 text-sm">Green shows the right answer, red your wrong pick. Read the transcripts in the PDF for the ones you missed.</p>
      </section> : null}
      {audio.length ? <section className="card border border-base-300 bg-base-100 p-4 sm:p-5" aria-label="Listening audio">
        <h2 className="mb-2 flex items-center gap-2 font-bold"><FiHeadphones aria-hidden className="text-primary" />Listening audio</h2>
        <PaperAudioList audio={audio} />
      </section> : null}
      <AnswerSheet parts={parts} responses={responses} onChange={choose} mark={mark} />
      {error ? <p role="alert" className="alert alert-error text-sm">{error}</p> : null}
      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-box border border-base-300 bg-base-100 p-3">
        <span className="text-sm font-semibold">{answered}/{total} answered</span>
        {mark ? <button type="button" onClick={restart} className="btn btn-sm gap-2 rounded-full"><FiRotateCcw aria-hidden />Start again</button>
          : <button type="button" onClick={() => void check()} disabled={checking || !answered} className="btn btn-primary btn-sm gap-2 rounded-full">
            {checking ? <span className="loading loading-spinner loading-xs" /> : <FiCheckSquare aria-hidden />}Check answers</button>}
      </div>
      <SheetHistory history={sheet.data.history} />
    </div>
  );
}
