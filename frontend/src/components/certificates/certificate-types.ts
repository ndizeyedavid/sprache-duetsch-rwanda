export type CertificateDesign = {
  title: string;
  statement: string;
  grade?: string;
  signatoryName: string;
  signatoryRole: string;
  issuedPlace: string;
  completionDate: string;
};

export type CertificateDraft = {
  studentId: string;
  levelId: string;
  design: CertificateDesign;
  pdfUrl?: string;
  replacesCertificateId?: string;
};

export const defaultCertificateDesign = (signatoryName: string): CertificateDesign => ({
  title: 'Certificate of Completion',
  statement: 'has successfully completed the learning requirements of the following course.',
  signatoryName, signatoryRole: 'Academic Administration', issuedPlace: 'Kigali, Rwanda',
  completionDate: new Date().toISOString().slice(0, 10),
});
