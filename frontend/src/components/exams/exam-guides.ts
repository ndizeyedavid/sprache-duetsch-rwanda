// How each level's Goethe exam works, in our own words (from the official sample papers: parts, timing,
// scoring). Shown in the exam centre above the papers and tests. Levels without official papers yet
// have no guide.
export type ExamGuide = {
  exam: string;
  summary: string;
  parts: { name: string; time: string; what: string }[];
  scoring: string;
  tips: string[];
};

export const EXAM_GUIDES: Record<string, ExamGuide> = {
  A1: {
    exam: 'Goethe-Zertifikat A1: Start Deutsch 1',
    summary: 'Shows that you understand and use simple everyday German: introductions, numbers, prices, times, short messages and signs.',
    parts: [
      { name: 'Hören · Listening', time: 'about 20 min', what: '3 parts, 15 questions: short conversations (heard twice), announcements (heard once), phone messages (heard twice).' },
      { name: 'Lesen · Reading', time: '25 min', what: '3 parts, 15 questions: two short emails, choosing the right website or ad, signs and notices.' },
      { name: 'Schreiben · Writing', time: '20 min', what: 'Fill in a form with 5 details from a short text, then write a message of about 30 words covering 3 points.' },
      { name: 'Sprechen · Speaking', time: 'about 15 min, in a group', what: 'Introduce yourself, ask and answer questions with word cards, make requests with picture cards.' },
    ],
    scoring: 'Listening, reading, writing and speaking count 15 points each (60 in total). You pass with 60%.',
    tips: [
      'Read the question before the recording starts, so you know what to listen for.',
      'Numbers, prices, times and days come up again and again. Practise them until they are automatic.',
      'Wrong answers are often mentioned too. Listen for "nein", "nicht", "aber" and plans that change.',
      'In the message, answer all 3 points (3 of the 10 marks each) and start with a greeting and end with a closing.',
      'In the form, copy names and places exactly as they are written in the text.',
      'Prepare your introduction now: Name, Alter, Land, Wohnort, Sprachen, Beruf, Hobby.',
    ],
  },
  A2: {
    exam: 'Goethe-Zertifikat A2',
    summary: 'Shows that you manage familiar situations: shopping, work, travel, appointments, and short emails and conversations about your life.',
    parts: [
      { name: 'Lesen · Reading', time: '30 min', what: '4 parts, 20 questions: a newspaper article, an information board, an email, and matching 6 ads to 5 people (one person gets x).' },
      { name: 'Hören · Listening', time: 'about 30 min', what: '4 parts, 20 questions: radio and phone texts (twice), one conversation matched to pictures (once), short conversations (once), a radio interview (twice).' },
      { name: 'Schreiben · Writing', time: '30 min', what: 'An SMS to a friend (20–30 words) and an email to a teacher, landlord or boss (30–40 words), each covering 3 points.' },
      { name: 'Sprechen · Speaking', time: 'about 15 min, in pairs', what: 'Ask and answer personal questions with cards, talk about your life, then plan something together with your partner.' },
    ],
    scoring: 'Each part counts 25 points (100 in total). You need 60 to pass: at least 45 of the 75 written points and 15 of the 25 speaking points.',
    tips: [
      'In Lesen Teil 4 exactly one person has no matching ad: mark x for that person.',
      'Hören Teil 2 is played only once. Read all the options before it starts.',
      '"Eigentlich … aber …" means the first plan did not happen: that option is usually the trap.',
      'In both writing tasks, cover all 3 points. Use "Liebe/Lieber …" for friends and "Sehr geehrte/r …" for the email.',
      'For speaking, practise one minute each about your family, your work, your free time and your plans.',
    ],
  },
};

/** How to practise with an official sample exam from the exam centre. */
export const PAPER_STEPS = [
  'Download the PDF and open the student pages (Kandidatenblätter), on paper or on screen.',
  'Do Lesen with a timer, as in the real exam.',
  'Play the Hören audio on the Goethe-Institut page, only as often as each part says.',
  'Tick your answers on the online answer sheet here to see your score per part.',
  'Read the transcripts at the end of the PDF to find what you missed.',
  'Write the Schreiben tasks, then compare with the sample texts and marking rules in the PDF.',
];
