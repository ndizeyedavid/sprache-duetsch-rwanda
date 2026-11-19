import type { ReactNode } from 'react';
import type { AssessmentSection,MyAssessmentDetail } from '../../../lib/services/my-assessment-detail';
import { AuthenticatedMedia } from '../../ui/AuthenticatedMedia';
import type { QuestionPart } from '../AssessmentQuestion';
import { LimitedAudio } from './LimitedAudio';

type Item = MyAssessmentDetail['questions'][number];
type Group = { section: AssessmentSection | null; items: { item: Item; index: number }[] };

/** Questions grouped by exam part; questions no part lists (or a test without parts) follow as one plain group. */
function groupByPart(questions: Item[], sections: AssessmentSection[] = []): Group[] {
  const indexed = questions.map((item, index) => ({ item, index }));
  const byQuestion = new Map(indexed.map((entry) => [entry.item.question.id, entry]));
  const groups: Group[] = sections.map((section) => ({ section, items: section.questionIds.flatMap((id) => byQuestion.get(id) ?? []) }))
    .filter((group) => group.items.length);
  const placed = new Set(groups.flatMap((group) => group.items.map((entry) => entry.item.question.id)));
  const rest = indexed.filter((entry) => !placed.has(entry.item.question.id));
  return rest.length ? [...groups, { section: null, items: rest }] : groups;
}

function PartHeader({ section, playKey }: { section: AssessmentSection; playKey: string }) {
  return <header className="space-y-3 rounded-box border border-base-300 bg-base-100 p-4 sm:p-5">
    <h2 className="text-base font-bold" lang="de">{section.title}</h2>
    {section.intro ? <p className="text-sm leading-6 text-muted whitespace-pre-line">{section.intro}</p> : null}
    {section.audioUrl && section.plays ? <LimitedAudio url={section.audioUrl} plays={section.plays} playKey={playKey} label="Recording for this part" />
      : section.audioUrl ? <AuthenticatedMedia url={section.audioUrl} kind="audio" className="w-full" /> : null}
    {section.passage ? <div lang="de" className="space-y-3 rounded-field bg-base-200 p-4 text-sm leading-7 whitespace-pre-line">
      {section.passage.split(/\n\s*\n/).map((paragraph, at) => <p key={at}>{paragraph}</p>)}
    </div> : null}
  </header>;
}

type Props = { questions: Item[]; sections?: AssessmentSection[]; playKey: string; renderQuestion: (item: Item, index: number, part: QuestionPart) => ReactNode };

/**
 * The test in its exam parts (Assessment.sections): each part's instructions, reading text and shared
 * recording appear once above its questions, which keep their numbers across the whole test.
 */
export function AssessmentParts({ questions, sections, playKey, renderQuestion }: Props) {
  return <>{groupByPart(questions, sections).map(({ section, items }, at) => (
    <div key={`${at}-${section?.title ?? 'rest'}`} className="space-y-4">
      {section ? <PartHeader section={section} playKey={playKey} /> : null}
      {items.map(({ item, index }) => renderQuestion(item, index, { letters: section?.letters, plays: section?.plays, playKey }))}
    </div>
  ))}</>;
}
