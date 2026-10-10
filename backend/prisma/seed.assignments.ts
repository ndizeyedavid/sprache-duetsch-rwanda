// Optional local demo content. Run: node --import tsx prisma/seed.assignments.ts
import { prisma } from '../src/lib/prisma.js';
const teacher = await prisma.user.findUnique({ where: { email: 'clarisse@sparch.rw' } });
if (!teacher) throw new Error('Run the base development seed first.');
const group = await prisma.classGroup.findFirst({ where: { teacherId: teacher.id, level: { code: 'A1' }, isActive: true } });
if (!group) throw new Error('An A1 class assigned to Clarisse is required.');
const dueAt = new Date(); dueAt.setUTCDate(dueAt.getUTCDate() + 7); dueAt.setUTCHours(18, 0, 0, 0);
const tasks = [
  { title: 'Hallo! Introduce yourself', responseType: 'TEXT' as const, estimatedMinutes: 20,
    instructions: 'Your goal: introduce yourself using simple German sentences.\n\n1. Write 5–7 sentences about yourself. Include your name, where you live, the languages you speak, and one hobby.\n2. Use complete sentences and capitalise German nouns.\n3. Read your introduction aloud and check the spelling.\n\nExample: Ich heiße … . Ich wohne in … . Ich spreche … .\n\nSubmit your introduction in the written response box. Your draft saves automatically.',
    rubric: [{ title: 'Clear introduction', description: 'Include the requested information in complete sentences.', points: 4 }, { title: 'German vocabulary & grammar', description: 'Use familiar words, correct verb forms and capitalised nouns.', points: 4 }, { title: 'Careful presentation', description: 'Check spelling and punctuation.', points: 2 }] },
  { title: 'Meine Woche — tell us about your week', responseType: 'AUDIO' as const, estimatedMinutes: 15,
    instructions: 'Your goal: practise speaking about everyday activities.\n\n1. Prepare 4–6 short sentences about your week. Use at least three days of the week.\n2. Practise saying your sentences aloud. Speak slowly and clearly.\n3. Record 30–60 seconds using the microphone button, or upload an audio recording.\n\nSentence starters: Am Montag … . Am Mittwoch … . Am Wochenende … .\n\nBefore submitting, download your attached recording and listen once to check that your voice is audible.',
    rubric: [{ title: 'Task completed', description: 'Describe activities on at least three days.', points: 4 }, { title: 'Pronunciation', description: 'Speak clearly enough for a listener to understand.', points: 3 }, { title: 'Sentence building', description: 'Use appropriate vocabulary and simple verb forms.', points: 3 }] },
  { title: 'Ein kleiner Dialog — at the café', responseType: 'MIXED' as const, estimatedMinutes: 25,
    instructions: 'Your goal: use polite German in a simple café conversation.\n\n1. Write a dialogue with two people: a customer and a café worker.\n2. Include a greeting, an order, a price, and a polite goodbye. Aim for 6–8 lines.\n3. Use at least two of these expressions: Guten Tag! / Ich möchte … / Bitte. / Danke!\n\nYou may type your dialogue here, attach a photo or PDF of your handwritten work, or upload a recording of the conversation. Check that any uploaded work is easy to read or hear.',
    rubric: [{ title: 'Complete conversation', description: 'Include all four parts of the café exchange.', points: 5 }, { title: 'Useful German', description: 'Use polite phrases and understandable sentences.', points: 3 }, { title: 'Readable or audible response', description: 'Present your work clearly.', points: 2 }] },
];
try {
  for (const task of tasks) {
    const exists = await prisma.assignment.findFirst({ where: { classGroupId: group.id, title: task.title, createdById: teacher.id } });
    if (!exists) await prisma.assignment.create({ data: { ...task, classGroupId: group.id, createdById: teacher.id, dueAt, status: 'PUBLISHED', maxPoints: 10, allowLate: true, maxSubmissions: 3 } });
  }
  console.log('A1 demo assignments are ready. Existing work was preserved.');
} finally { await prisma.$disconnect(); }
