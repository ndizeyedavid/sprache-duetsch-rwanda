import { AssessmentQuestion } from '../AssessmentQuestion';
import type { HomeworkQuestion } from './types';

type Props = { questions: HomeworkQuestion[]; responses: Record<string, unknown>; disabled: boolean; onChange?: (id: string, value: unknown) => void };
export function HomeworkQuestions({ questions, responses, disabled, onChange }: Props) {
  return <div className="space-y-4">{questions.map((item, index) => <AssessmentQuestion key={item.id} item={item} index={index} value={responses[item.question.id]} disabled={disabled} onChange={value => onChange?.(item.question.id, value)} />)}</div>;
}
