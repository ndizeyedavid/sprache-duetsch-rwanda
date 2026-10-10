import type { LessonActivity } from '../../../lib/services';
import { activityConfig,practiceKinds } from './practice-draft';

export function PracticePreview({ activity }: { activity: LessonActivity }) {
  const config=activityConfig(activity),kind=practiceKinds.find(item=>item.type===activity.type);
  const question=String(config.question??config.statement??config.prompt??config.sentence??'');
  return <article className="rounded-box bg-base-200 p-5">
    <p className="text-xs text-muted">{kind?.label??'Practice activity'}</p><h3 className="mt-1 text-base font-semibold">{activity.title}</h3>
    {activity.instructions?<p className="mt-2 text-sm text-muted">{activity.instructions}</p>:null}
    {question?<p className="mt-4 text-sm">{question}</p>:null}
    {activity.type==='MCQ'&&Array.isArray(config.options)?<div className="mt-4 space-y-2">{config.options.map((option,index)=><label key={index} className="flex items-center gap-3 rounded-field bg-base-100 p-3 text-sm"><input type="radio" name={`preview-${activity.id}`} className="radio radio-sm"/>{String(option)}</label>)}</div>:null}
    {activity.type==='TRUE_FALSE'?<div className="mt-4 flex gap-5">{['True','False'].map(value=><label key={value} className="flex items-center gap-2 text-sm"><input type="radio" className="radio radio-sm" name={`preview-${activity.id}`}/>{value}</label>)}</div>:null}
    {activity.type==='FILL_BLANK'?<div className="mt-3 space-y-3">{Array.isArray(config.sentences)?config.sentences.map((row,index)=><label key={index} className="block text-sm">{String((row as Record<string,unknown>).text??'')}<input className="input mt-2 w-full" placeholder="Your answer"/></label>):<input className="input w-full" aria-label="Your answer" placeholder="Your answer"/>}</div>:null}
    {activity.type==='MATCHING'&&Array.isArray(config.pairs)?<div className="mt-4 grid grid-cols-2 gap-3">{config.pairs.map((row,index)=><div key={index} className="rounded-field bg-base-100 p-3 text-sm">{String((row as Record<string,unknown>).left??'')}</div>)}{[...config.pairs].reverse().map((row,index)=><div key={`right-${index}`} className="rounded-field bg-base-100 p-3 text-sm">{String((row as Record<string,unknown>).right??'')}</div>)}</div>:null}
    {activity.type==='WRITING'?config.isDocumentSubmission?<input aria-label="Practice file" className="file-input mt-4 w-full" type="file"/>:<textarea aria-label="Practice response" className="textarea mt-4 w-full" placeholder="Write your response…"/>:null}
  </article>;
}
