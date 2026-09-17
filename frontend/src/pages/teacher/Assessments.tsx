import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Panel } from '../../components/ui/Panel';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { listClasses, listLevels } from '../../lib/services';
import { LevelRail } from '../../components/assessments/LevelRail';
import { QuestionBankPanel } from '../../components/assessments/QuestionBankPanel';
import { AssessmentGroups } from '../../components/assessments/AssessmentGroups';

const TABS = ['Question bank', 'Assessments'] as const;
type Tab = (typeof TABS)[number];

export function TeacherAssessments() {
 const [searchParams, setSearchParams] = useSearchParams();
 const classes = useApi('teacher-classes', listClasses);
 const levels = useApi('levels-catalog', listLevels);

 const allowedLevels = useMemo(() => {
 const ids = new Set((classes.data ?? []).map((g) => g.levelId));
 return (levels.data ?? []).filter((l) => ids.has(l.id));
 }, [classes.data, levels.data]);

 const tabParam = searchParams.get('tab');
 const initialTab: Tab = tabParam === 'assessments' ? 'Assessments' : 'Question bank';
 const [tab, setTab] = useState<Tab>(initialTab);

 useEffect(() => {
 const next = searchParams.get('tab');
 if (next === 'assessments' && tab !== 'Assessments') setTab('Assessments');
 if (next !== 'assessments' && tab !== 'Question bank') setTab('Question bank');
 }, [searchParams, tab]);

 function switchTab(next: Tab) {
 setTab(next);
 const params = new URLSearchParams(searchParams);
 if (next === 'Assessments') params.set('tab', 'assessments');
 else params.delete('tab');
 setSearchParams(params);
 }

 const levelParam = searchParams.get('level');
 const [selectedLevelId, setSelectedLevelId] = useState<string | null>(() => {
 if (levelParam) {
 const found = allowedLevels.find((l) => l.id === levelParam || l.code === levelParam);
 if (found) return found.id;
 }
 return allowedLevels[0]?.id ?? null;
 });

 useEffect(() => {
 if (allowedLevels.length === 0) return;
 const param = searchParams.get('level');
 if (param) {
 const found = allowedLevels.find((l) => l.id === param || l.code === param);
 if (found && found.id !== selectedLevelId) setSelectedLevelId(found.id);
 } else if (!selectedLevelId) {
 setSelectedLevelId(allowedLevels[0].id);
 }
 }, [allowedLevels, searchParams, selectedLevelId]);

 function selectLevel(id: string) {
 setSelectedLevelId(id);
 const next = new URLSearchParams(searchParams);
 next.set('level', id);
 setSearchParams(next);
 }

 if (classes.loading || levels.loading) return <LoadingBlock label="Loading your levels…" />;
 if (classes.error || levels.error) {
 return <ErrorBlock message={classes.error ?? levels.error ?? 'Could not load levels.'} onRetry={() => { classes.refetch(); levels.refetch(); }} />;
 }
 if (allowedLevels.length === 0) {
 return <Panel><EmptyBlock title="No levels assigned" hint="You can create assessments once an academic admin assigns you to a class group." /></Panel>;
 }

 return (
 <div className="space-y-4">
 <Panel>
 <LevelRail levels={allowedLevels} selectedId={selectedLevelId} onSelect={selectLevel} />
 {selectedLevelId ? <p className="mt-2 text-xs text-muted">{allowedLevels.find((l) => l.id === selectedLevelId)?.title ?? ''} · Assessments are scoped to this level. Question bank questions are reusable across assessments for the same level.</p> : null}
 </Panel>

 <div className="flex flex-wrap items-center justify-between gap-3">
 <div role="tablist" aria-label="Assessments" className="tabs tabs-boxed w-fit bg-base-100 p-1">
 {TABS.map((name) => (
 <button key={name} role="tab" aria-selected={tab === name} onClick={() => switchTab(name)} className={`tab ${tab === name ? 'tab-active bg-brand text-white' : ''}`}>{name}</button>
 ))}
 </div>
 <Link to="/teacher/grading" className="btn btn-sm rounded-full border-line bg-base-100">Go to grading →</Link>
 </div>

 {tab === 'Question bank' ? <QuestionBankPanel levels={allowedLevels} selectedLevelId={selectedLevelId} /> : <AssessmentGroups levels={allowedLevels} selectedLevelId={selectedLevelId} />}
 </div>
 );
}
