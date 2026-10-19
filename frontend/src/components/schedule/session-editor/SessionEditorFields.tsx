import { format } from 'date-fns';
import type { ReactNode } from 'react';
import { MODE_OPTIONS,PROVIDER_OPTIONS } from '../constants';
import { RepeatField } from '../RepeatField';
import type { SessionDraft } from './useSessionDraft';

type Props = { draft: SessionDraft; classes: { id: string; name: string }[]; editing: boolean };

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-3"><h3 className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted">{title}</h3>{children}</section>
);
const label = 'block text-xs font-medium';

/** The editor body, grouped: class & topic, when, where, after class. */
export function SessionEditorFields({ draft, classes, editing }: Props) {
  const { values: v, set, locked, saving } = draft;
  return (
    <div className="space-y-6">
      <fieldset disabled={locked || saving} className="space-y-6">
        <Section title="Class & topic">
          <label className={label}>Class<select aria-label="Class" required disabled={editing} className="select mt-1.5 w-full" value={v.classId} onChange={(e) => set.setClass(e.target.value)}>
            <option value="">Choose class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className={label}>Topic<input data-autofocus className="input mt-1.5 w-full" value={v.title} onChange={(e) => set.setTitle(e.target.value)} placeholder="e.g. Einkaufen auf dem Markt" /></label>
        </Section>
        <Section title="When">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <label className={`${label} col-span-2 sm:col-span-1`}>Date<input required type="date" min={locked ? undefined : format(new Date(), 'yyyy-MM-dd')} className="input mt-1.5 w-full" value={v.date} onChange={(e) => set.setDate(e.target.value)} /></label>
            <label className={label}>Start<input required type="time" min={editing ? undefined : "08:00"} max={editing ? undefined : "21:30"} step={300} className="input mt-1.5 w-full" value={v.start} onChange={(e) => set.setStart(e.target.value)} /></label>
            <label className={label}>End<input required type="time" min={editing ? undefined : "08:30"} max={editing ? undefined : "22:00"} step={300} className="input mt-1.5 w-full" value={v.end} onChange={(e) => set.setEnd(e.target.value)} /></label>
          </div>
          {draft.inPast ? (
            <p role="alert" className="rounded-field bg-error px-3 py-2 text-xs font-medium text-error-content">This time has already passed. Pick a later date or start time.</p>
          ) : <p className="text-[0.6875rem] text-muted">Classes run between 08:00 and 22:00, from now on.</p>}
          <RepeatField enabled={v.repeat} onEnabled={set.setRepeat} count={v.weeks} onCount={set.setWeeks} date={v.date} startTime={v.start} endTime={v.end} disabled={editing} />
        </Section>
        <Section title="Where">
          <div className="grid grid-cols-3 gap-1 rounded-full bg-base-200 p-1" role="group" aria-label="Class format">
            {MODE_OPTIONS.map((o) => (
              <button type="button" key={o.value} aria-pressed={v.mode === o.value} onClick={() => set.setMode(o.value)}
                className={`btn btn-sm gap-1.5 rounded-full border-0 ${v.mode === o.value ? 'btn-primary' : 'btn-ghost'}`}><o.icon aria-hidden />{o.label}</button>
            ))}
          </div>
          {v.mode !== 'ONSITE' ? <div className="grid gap-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
            <label className={label}>Provider<select className="select mt-1.5 w-full" value={v.provider} onChange={(e) => set.setProvider(e.target.value)}>{PROVIDER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>
            <label className={label}>Meeting link<input required type="url" className="input mt-1.5 w-full" placeholder="https://meet.google.com/…" value={v.link} onChange={(e) => set.setLink(e.target.value)} /></label>
          </div> : null}
          {v.mode !== 'ONLINE' ? <label className={label}>Room<input className="input mt-1.5 w-full" value={v.room} onChange={(e) => set.setRoom(e.target.value)} placeholder="e.g. Room 2, Kacyiru campus" /></label> : null}
        </Section>
      </fieldset>
      <Section title={locked ? 'After class (still editable)' : 'Notes & recording'}>
        <label className={label}>Notes for students<textarea disabled={saving} className="textarea mt-1.5 w-full" rows={3} value={v.notes} onChange={(e) => set.setNotes(e.target.value)} /></label>
        <label className={label}>Recording link<input disabled={saving} type="url" className="input mt-1.5 w-full" placeholder="https://…" value={v.recording} onChange={(e) => set.setRecording(e.target.value)} /></label>
      </Section>
      {draft.error ? <p role="alert" className="alert alert-error alert-soft text-xs">{draft.error}</p> : null}
    </div>
  );
}
