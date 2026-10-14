import type { ReactNode } from 'react';
import { FiFileText } from 'react-icons/fi';
import type { AuthoredLesson } from '../../lib/services';
import { PracticePreview } from './studio/PracticePreview';

type Props={draft:{title:string;description:string;videoUrl:string;audioUrl:string;estimatedMinutes:string};lesson:AuthoredLesson;children:ReactNode};
export function PreparationPreview({draft,lesson,children}:Props){
  const activities=lesson.activities.filter(item=>item.isPublished);
  return <div className="space-y-6">
    <p className="rounded-field bg-base-200 px-4 py-3 text-xs text-muted">Try the lesson here. Preview answers are not saved.</p>
    <header><p className="text-xs text-muted">{draft.estimatedMinutes?`${draft.estimatedMinutes} min`:''}</p><h1 className="mt-2 text-2xl font-semibold">{draft.title}</h1>{draft.description?<p className="mt-3 text-sm leading-6 text-muted">{draft.description}</p>:null}</header>
    {draft.videoUrl?<video controls preload="none" src={draft.videoUrl} className="w-full rounded-box"/>:null}
    {draft.audioUrl?<audio controls preload="none" src={draft.audioUrl} className="w-full"/>:null}
    {children}
    {lesson.materials.length?<section><h2 className="mb-3 text-lg font-semibold">Resources</h2><div className="space-y-2">{lesson.materials.map(item=><div className="flex items-center gap-3 rounded-box bg-base-200 p-4" key={item.id}><span className="flex size-10 items-center justify-center rounded-field bg-base-100"><FiFileText aria-hidden/></span><div><p className="text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-muted">{item.type}{item.isDownloadable?' · Downloadable':''}</p></div></div>)}</div></section>:null}
    <section id="lesson-practice"><h2 className="mb-3 text-lg font-semibold">Practice</h2>{activities.length?<div className="space-y-4">{activities.map(activity=><PracticePreview key={activity.id} activity={activity}/>)}</div>:<p className="text-sm text-muted">Publish an activity to include it in the student lesson.</p>}</section>
  </div>;
}
