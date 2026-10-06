import { drawCertificateSection1 } from './draw-certificate-section-1.js';
import { drawCertificateSection2 } from './draw-certificate-section-2.js';
import { drawCertificateSection3 } from './draw-certificate-section-3.js';
import { drawCertificateSection4 } from './draw-certificate-section-4.js';
import { prepareCertificatePdf } from './prepare-certificate-pdf.js';
export const renderCertificatePdf = async (id: string): Promise<Buffer> => {
const section0 = await prepareCertificatePdf(id);
const section1 = drawCertificateSection1(section0);
const section2 = drawCertificateSection2(section1);
const section3 = drawCertificateSection3(section2);
const section4 = drawCertificateSection4(section3);
return section4.done;
};
