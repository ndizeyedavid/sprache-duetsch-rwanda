import { useEffect,useState } from 'react';
import { useApi } from '../../hooks/useApi';
import type { ActivityQuestion } from './activity-question';
import { LessonEditorSection102 } from './lesson-editor-section102';
export function LessonEditor({
  lessonId,
  data,
  busy,
  onRun,
  fieldErrors,
  onFieldErrorsChange,
  onSaved,
  onDeleted,
  materialForm,
  setMaterialForm,
  activityForm,
  setActivityForm,
}: {
  lessonId: string;
  data: NonNullable<ReturnType<typeof useApi>['data']> & {
  title: string;
  contentType: string;
  body: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  estimatedMinutes: number | null;
  isPublished: boolean;
  materials: {
  id: string;
  title: string;
  type: string;
  url: string | null;
  isDownloadable: boolean;
  mimeType: string | null;
  }[];
  activities: {
  id: string;
  title: string;
  type: string;
  instructions: string | null;
  order: number;
  isPublished: boolean;
  }[];
  };
  busy: boolean;
  onRun: (action: () => Promise<unknown>, fallback: string, after?: () => void) => Promise<void>;
  fieldErrors: Record<string, string>;
  onFieldErrorsChange: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSaved: () => void;
  onDeleted: () => void;
  materialForm: { title: string; type: string; url: string };
  setMaterialForm: React.Dispatch<React.SetStateAction<{ title: string; type: string; url: string }>>;
  activityForm: { title: string; type: string; instructions: string };
  setActivityForm: React.Dispatch<React.SetStateAction<{ title: string; type: string; instructions: string }>>;
}) {
 const [edit, setEdit] = useState({
 title: data.title,
 contentType: data.contentType,
 body: data.body ?? '',
 videoUrl: data.videoUrl ?? '',
 audioUrl: data.audioUrl ?? '',
 estimatedMinutes: data.estimatedMinutes != null ? String(data.estimatedMinutes) : '',
 isPublished: data.isPublished,
 });
 useEffect(() => {
 setEdit({
 title: data.title,
 contentType: data.contentType,
 body: data.body ?? '',
 videoUrl: data.videoUrl ?? '',
 audioUrl: data.audioUrl ?? '',
 estimatedMinutes: data.estimatedMinutes != null ? String(data.estimatedMinutes) : '',
 isPublished: data.isPublished,
 });
 }, [data]);

 const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
 const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
 const [materialDraft, setMaterialDraft] = useState({ title: '', type: 'NOTE', url: '', isDownloadable: true });
 const [activityDraft, setActivityDraft] = useState({ title: '', type: 'MCQ', instructions: '', isPublished: true });
 const [showAddMaterial, setShowAddMaterial] = useState(false);
 const [showAddActivity, setShowAddActivity] = useState(false);
 const [activityQ, setActivityQ] = useState<ActivityQuestion>({ kind: 'MCQ', question: '', options: ['', '', '', ''], correctIndex: 0 });

 function startEditMaterial(m: { id: string; title: string; type: string; url: string | null; isDownloadable: boolean }) {
 setEditingMaterialId(m.id);
 setMaterialDraft({ title: m.title, type: m.type, url: m.url ?? '', isDownloadable: m.isDownloadable });
 }

 function startEditActivity(a: { id: string; title: string; type: string; instructions: string | null; isPublished: boolean }) {
 setEditingActivityId(a.id);
 setActivityDraft({ title: a.title, type: a.type, instructions: a.instructions ?? '', isPublished: a.isPublished });
 }

 return (
 <LessonEditorSection102 edit={edit} setEdit={setEdit} fieldErrors={fieldErrors} onFieldErrorsChange={onFieldErrorsChange} busy={busy} onRun={onRun} lessonId={lessonId} onSaved={onSaved} onDeleted={onDeleted} data={data} editingMaterialId={editingMaterialId} setEditingMaterialId={setEditingMaterialId} startEditMaterial={startEditMaterial} materialDraft={materialDraft} setMaterialDraft={setMaterialDraft} setShowAddMaterial={setShowAddMaterial} showAddMaterial={showAddMaterial} materialForm={materialForm} setMaterialForm={setMaterialForm} editingActivityId={editingActivityId} setEditingActivityId={setEditingActivityId} startEditActivity={startEditActivity} activityDraft={activityDraft} setActivityDraft={setActivityDraft} setShowAddActivity={setShowAddActivity} showAddActivity={showAddActivity} activityForm={activityForm} activityQ={activityQ} setActivityForm={setActivityForm} setActivityQ={setActivityQ} />
 );
}
