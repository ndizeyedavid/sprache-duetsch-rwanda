import { useState } from 'react';
import { FiAward,FiDownload,FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { apiErrorMessage,downloadFile } from '../../lib/api';
import type { Certificate } from '../../lib/services';
import { humanize,isoDate } from '../../lib/services';
import { StatusBadge } from '../ui/StatusBadge';

type Props = { certificates: Certificate[]; onRevoke: (certificate: Certificate) => void };
export function CertificateRegister({ certificates, onRevoke }: Props) {
 const [working, setWorking] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 async function download(c: Certificate) {
   setWorking(c.id); setError(null);
   try { await downloadFile(`/certificates/${c.id}/pdf`, `${c.certificateNumber}.pdf`); }
   catch (err) { setError(apiErrorMessage(err, 'Could not download the certificate.')); }
   finally { setWorking(null); }
 }
 return <div>{error && <p role="alert" className="mb-3 text-xs text-error">{error}</p>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{certificates.map(c => <article key={c.id} className="card border border-base-300/70 bg-base-100 p-5"><div className="flex items-center justify-between gap-2"><span className="grid size-10 place-items-center rounded-xl bg-secondary/15"><FiAward aria-hidden /></span><StatusBadge status={humanize(c.status)} /></div><h3 className="mt-4 text-sm font-semibold">{c.student ? `${c.student.user.firstName} ${c.student.user.lastName}` : c.certificateNumber}</h3><p className="mt-1 text-xs text-base-content/65">{c.level.code} · {isoDate(c.issuedAt)}</p><p className="mt-3 break-all font-mono text-[10px] text-base-content/55">{c.certificateNumber}</p><div className="mt-4 flex flex-wrap gap-2"><button className="btn btn-sm rounded-full" disabled={working !== null} onClick={() => download(c)}><FiDownload aria-hidden />{working === c.id ? 'Downloading…' : 'PDF'}</button><Link className="btn btn-sm rounded-full" to={`/verify/${c.verificationCode}`} target="_blank"><FiExternalLink aria-hidden />Verify</Link>{c.status === 'ISSUED' && <button className="btn btn-ghost btn-sm rounded-full text-error" onClick={() => onRevoke(c)}>Revoke</button>}</div>{c.revokeReason && <p className="mt-3 text-xs text-base-content/60">{c.revokeReason}</p>}</article>)}</div></div>;
}
