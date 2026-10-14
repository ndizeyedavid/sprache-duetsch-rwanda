// Shape of the course JSON embedded in the deutschsprache.org HTML exports (deutschsprache-b1.html,
// deutschsprache-b2-1.html). German field names are kept as-is.
export type CoursePhoto = { id: string; alt: string; fotograf: string; profil: string; datei?: string };
export type CourseTable = { kopf: string[]; zeilen: string[][] };
export type CourseGrammar = {
  titel: string;
  erklaerung: string;
  tabelle?: CourseTable;
  beispiele: { de: string; hinweis?: string }[];
  tipp?: string;
};
export type CourseWord = { wort: string; en: string; fr: string; beispiel: string };
export type CoursePhrases = { funktion: string; saetze: string[] };
export type CourseWritingTask = { aufgabe: string; woerter: string; checkliste: string[] };
export type CourseGapExercise = { typ: "gap"; frage: string; loesung: string[]; erklaerung: string };
export type CourseChoiceExercise = { typ: "mc"; frage: string; optionen: string[]; loesung: string; erklaerung: string };
export type CourseExercise = CourseGapExercise | CourseChoiceExercise;
export type CourseLesson = {
  nr: number;
  modul: number;
  /** Unit code such as "1A" (B2 onwards). */
  code?: string;
  thema: string;
  titel: string;
  kurz: string;
  /** Text type of the lesson's reading/listening input (B2 onwards). */
  textsorte?: string;
  /** Exam parts the lesson prepares for (B2 onwards). */
  pruefung?: string;
  bild?: CoursePhoto;
  lernziele: string[];
  grammatik: CourseGrammar[];
  wortschatz: CourseWord[];
  redemittel: CoursePhrases[];
  /** Free writing task with word range and checklist (B2 onwards). */
  schreibaufgabe?: CourseWritingTask;
  uebungen: CourseExercise[];
};
export type CourseModule = { nr: number; titel: string; beschreibung: string; lektionen: number[] };
export type CourseJson = {
  source: { file: string; sha256: string };
  meta: { titel: string; niveau: string; version: string; stand: string; herausgeber: string; hinweis: string };
  module: CourseModule[];
  lektionen: CourseLesson[];
};
