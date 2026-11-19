// The official Goethe-Institut sample exams the school gives its students in the exam centre (the PDFs
// sit in the repo root). © Goethe-Institut: shared unchanged, with the source named and linked; the
// official pages also have the listening audio. Answer keys are the papers' own "Lösungen" pages, in
// the staff format of src/modules/exam-papers/answer-key.ts.
export type GoethePaper = {
  key: string;
  level: string;
  file: string;
  fileName: string;
  title: string;
  edition: string;
  description: string;
  sourceUrl: string;
  order: number;
  answerKey: string;
};

const A1_PAGE = "https://www.goethe.de/ins/de/de/prf/gzsd1/ueb.html";
const A2_PAGE = "https://www.goethe.de/ins/de/de/prf/prf/gzsd2/ub2.html";

export const GOETHE_PAPERS: GoethePaper[] = [
  {
    key: "goethe-a1-sd1-modellsatz", level: "A1", file: "sd_1_modellsatz.pdf", fileName: "Goethe-A1-Start-Deutsch-1-Modellsatz.pdf",
    title: "Start Deutsch 1 · Modellsatz", edition: "8. Auflage, 2024", order: 1, sourceUrl: A1_PAGE,
    description: "The official A1 sample exam: listening, reading, writing and speaking, with transcripts, answers and marking rules. Play the listening audio on the Goethe-Institut page.",
    answerKey: [
      "Hören Teil 1 | a b c | c b a b a c",
      "Hören Teil 2 | Richtig Falsch | Falsch Falsch Richtig Richtig",
      "Hören Teil 3 | a b c | a c c b b",
      "Lesen Teil 1 | Richtig Falsch | Richtig Falsch Falsch Falsch Richtig",
      "Lesen Teil 2 | a b | b a a a b",
      "Lesen Teil 3 | Richtig Falsch | Richtig Falsch Falsch Richtig Richtig",
    ].join("\n"),
  },
  {
    key: "goethe-a2-modellsatz", level: "A2", file: "A2_Modellsatz_Erwachsene.pdf", fileName: "Goethe-A2-Modellsatz-Erwachsene.pdf",
    title: "Goethe-Zertifikat A2 · Modellsatz", edition: "2016", order: 1, sourceUrl: A2_PAGE,
    description: "The official A2 sample exam for adults: reading, listening, writing and speaking, with transcripts, answers and marked sample texts. Play the listening audio on the Goethe-Institut page.",
    answerKey: [
      "Lesen Teil 1 | a b c | c c c a a",
      "Lesen Teil 2 | a b c | c b c b a",
      "Lesen Teil 3 | a b c | c a c b c",
      "Lesen Teil 4 | a b c d e f x | f c x b a",
      "Hören Teil 1 | a b c | b b c b a",
      "Hören Teil 2 | a b c d e f g h i | b g h d e",
      "Hören Teil 3 | a b c | c a b b b",
      "Hören Teil 4 | Ja Nein | Nein Ja Ja Nein Nein",
    ].join("\n"),
  },
  {
    key: "goethe-a2-uebungssatz-01", level: "A2", file: "A2_Uebungssatz_Erwachsene (1).pdf", fileName: "Goethe-A2-Uebungssatz-01-Erwachsene.pdf",
    title: "Goethe-Zertifikat A2 · Übungssatz 01", edition: "2021", order: 2, sourceUrl: A2_PAGE,
    description: "A second complete A2 practice exam in the same format, with transcripts, answers and marked sample texts. Play the listening audio on the Goethe-Institut page.",
    answerKey: [
      "Lesen Teil 1 | a b c | b b c b a",
      "Lesen Teil 2 | a b c | b b b c b",
      "Lesen Teil 3 | a b c | b c b c c",
      "Lesen Teil 4 | a b c d e f x | f c e x b",
      "Hören Teil 1 | a b c | b c b c a",
      "Hören Teil 2 | a b c d e f g h i | e g h i a",
      "Hören Teil 3 | a b c | b c b a b",
      "Hören Teil 4 | Ja Nein | Ja Nein Ja Ja Nein",
    ].join("\n"),
  },
];
