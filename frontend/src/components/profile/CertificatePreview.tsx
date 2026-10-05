import { FiX } from "react-icons/fi";
import type { Certificate } from "../../lib/services";

type Props = { previewCert: Certificate; downloadingId: string | null; onClose: () => void; onDownloadCert: (id: string, num: string) => void };
export function CertificatePreview({ previewCert, downloadingId, onClose, onDownloadCert }: Props) {
  return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" aria-label="Close" onClick={() => onClose()} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-box bg-base-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <h4 className="text-sm font-bold">
                {previewCert.level.code} · {previewCert.level.title}
              </h4>
              <button type="button" onClick={() => onClose()} className="btn btn-ghost btn-xs btn-circle">
                <FiX aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-[#fdfbf7] p-4">
              {/* Mini certificate preview — mirrors new PDF: flag, centred logo, gold seal */}
              <div className="mx-auto max-h-[520px] max-w-[640px] overflow-hidden rounded-box border-[1.5px] border-[#c5a253] bg-[#fdfbf7] shadow-lg">
                {/* Flag top */}
                <div className="flex h-1.5 w-full">
                  <span className="flex-1 bg-black" />
                  <span className="flex-1 bg-[#dd0000]" />
                  <span className="flex-1 bg-[#ffce00]" />
                </div>
                <div className="px-6 py-5 text-center">
                  <img src="/logo.png" alt="Deutsch Sprache RW" className="mx-auto h-14 w-14 rounded-full border border-[#e7d9b0] bg-white object-contain p-1" />
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#c5a253]">Deutsch Sprache RW • Kigali</p>
                  <div className="mx-auto mt-2 flex w-40 items-center gap-2">
                    <span className="h-px flex-1 bg-[#e7d9b0]" />
                    <span className="flex gap-1">
                      <span className="h-1 w-6 bg-black" />
                      <span className="h-1 w-6 bg-[#dd0000]" />
                      <span className="h-1 w-6 bg-[#ffce00]" />
                    </span>
                    <span className="h-px flex-1 bg-[#e7d9b0]" />
                  </div>
                  <p className="mt-2 text-lg font-bold tracking-wide text-[#0f204b]">ZERTIFIKAT</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted">Certificate of Achievement</p>

                  <p className="mt-4 text-[11px] text-muted">This is to certify that</p>
                  <p className="mt-1 font-serif text-base font-bold text-[#0f204b]">Certificate Holder</p>
                  <div className="mx-auto mt-2 h-px w-40 bg-[#c5a253]" />
                  <p className="mx-auto mt-3 max-w-sm text-xs leading-relaxed text-[#1f2937]">
                    has demonstrated exceptional dedication and excellence in mastering the German language
                  </p>
                  <div className="mx-auto mt-3 flex max-w-[380px] items-center gap-2 rounded-lg border border-[#f4e8c1] bg-white px-3 py-2 text-left">
                    <span className="h-8 w-1 shrink-0 rounded bg-[#c5a253]" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-xs font-bold text-[#0f204b]">{previewCert.level.code} — {previewCert.level.title}</span>
                      <span className="block text-[10px] text-muted">Authorized by Deutsch Sprache RW • CEFR-aligned</span>
                    </span>
                  </div>
                  <div className="mx-auto mt-4 grid max-w-sm grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="font-serif text-xs italic">A. Mukamurenzi</p>
                      <div className="mt-1 h-px bg-[#c5a253]" />
                      <p className="mt-1 text-[10px] font-bold">Aline Mukamurenzi</p>
                      <p className="text-[10px] text-muted">Academic Director</p>
                    </div>
                    <div>
                      <p className="font-serif text-xs italic">C. Uwase</p>
                      <div className="mt-1 h-px bg-[#c5a253]" />
                      <p className="mt-1 text-[10px] font-bold">Clarisse Uwase</p>
                      <p className="text-[10px] text-muted">Head of Program</p>
                    </div>
                  </div>
                  <p className="mt-4 font-mono text-[10px] text-muted">{previewCert.certificateNumber} · {previewCert.verificationCode}</p>
                  <a href={`/verify/${previewCert.verificationCode}`} className="mt-1 inline-block text-xs font-medium text-brand hover:underline">
                    Verify at /verify/{previewCert.verificationCode} →
                  </a>
                </div>
                <div className="flex h-1.5 w-full">
                  <span className="flex-1 bg-black" />
                  <span className="flex-1 bg-[#dd0000]" />
                  <span className="flex-1 bg-[#ffce00]" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-line bg-base-100 px-4 py-3">
              <button type="button" onClick={() => onClose()} className="btn btn-sm rounded-full border-line bg-base-100">
                Close
              </button>
              <button
                type="button"
                disabled={downloadingId === previewCert.id}
                onClick={() => onDownloadCert(previewCert.id, previewCert.certificateNumber)}
                className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90 disabled:opacity-60"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
  );
}
