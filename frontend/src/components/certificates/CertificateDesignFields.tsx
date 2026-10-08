import type { CertificateDesign } from './certificate-types';

type Props = { design: CertificateDesign; onChange: (design: CertificateDesign) => void; uploaded: boolean };
export function CertificateDesignFields({ design, onChange, uploaded }: Props) {
  const field = (key: keyof CertificateDesign) => ({ value: design[key] ?? '', onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...design, [key]: event.target.value }) });
  return <div className="space-y-4">
    {!uploaded && <>
      <label className="block text-sm">Certificate title<input className="input mt-1.5 w-full" required maxLength={70} {...field('title')}/></label>
      <label className="block text-sm">Award wording<textarea className="textarea mt-1.5 w-full" rows={3} required minLength={10} maxLength={280} {...field('statement')}/><span className="mt-1 block text-xs text-base-content/60">Appears between the learner’s name and course title.</span></label>
      <label className="block text-sm">Result or distinction <span className="text-base-content/50">(optional)</span><input className="input mt-1.5 w-full" maxLength={80} placeholder="e.g. Overall result: Sehr gut · 92%" {...field('grade')}/><span className="mt-1 block text-xs text-base-content/60">Shown as a highlight under the course title and on the public verification page.</span></label>
    </>}
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm">Completion date<input type="date" className="input mt-1.5 w-full" required max={new Date().toISOString().slice(0, 10)} {...field('completionDate')}/></label>
      <label className="block text-sm">Place of issue<input className="input mt-1.5 w-full" required maxLength={80} {...field('issuedPlace')}/></label>
      <label className="block text-sm">Signatory name<input className="input mt-1.5 w-full" required maxLength={100} {...field('signatoryName')}/></label>
      <label className="block text-sm">Signatory role<input className="input mt-1.5 w-full" required maxLength={80} {...field('signatoryRole')}/></label>
    </div>
    <p className="text-xs leading-5 text-base-content/60">{uploaded ? 'These details are kept in the school record. Your uploaded PDF is delivered exactly as supplied.' : 'The learner and course names come from school records. The certificate number and verification QR are added when issued.'}</p>
  </div>;
}
