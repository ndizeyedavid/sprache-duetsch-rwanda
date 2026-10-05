# A1 coursebook import

Source: `Deutsch_A1_Kursbuch.pdf`, 215 pages. The checked-in manifest records its SHA-256 hash and source pages for every unit. The original was found at `../dignity/.material/Deutsch_A1_Kursbuch.pdf` relative to the repository.

The actual headings define 10 parts and 50 units (the introduction incorrectly refers to Unit 49 as the answer key; it is Unit 50). Content, tables, original illustrations, dialogue turns, exercises, selected model answers and the word list are retained. Unit 49 has 30 interactive practice-test tasks; the other units contain 229 original exercises. Fifty additional short questions check the unit topics.

From the repository root, rebuild the manifest and compressed source illustrations:

```sh
# Requires Poppler (pdftohtml/pdftotext) and Python Pillow.
python3 scripts/course-import/extract_a1.py /path/to/Deutsch_A1_Kursbuch.pdf
```

From `backend/`, inspect or apply to the configured database:

```sh
npx tsx prisma/course-import/import-a1.ts
npx tsx prisma/course-import/import-a1.ts --apply
```

Application backs up existing A1 curriculum, progress and submissions to private, gitignored `backend/backups/` before a transaction. Old demo modules/lessons/activities and linked assessments are unpublished, preserving their history. Stable IDs make subsequent imports update the same records without resetting student work. The normal seed skips imported coursebook modules. Accounts, enrolments, fees and payment records are untouched.

Self-study activities use `config.practiceMode: true`. Responses save through the existing authenticated activity API and MCQs receive immediate feedback. Practice is excluded from formal assignment lists and grading queues; written practice saves without claiming an automated grade. Model answers are revealed after a response where the source supplies one. Units remain browsable in order, with manual lesson completion tracking.

The source provides transcripts and suggested video searches, but no audio recordings. No audio files or external video URLs have been invented. The book's explanatory prose is predominantly English; examples and dialogues are German. Source exam descriptions are reproduced, not presented as independently verified current exam regulations.

Exercise rendering now uses one task at a time. Lettered sub-items are separate answer fields; source-labelled and unambiguous short answer keys are aligned per item. Long/short vowel and soft/hard pronunciation exercises use explicit choices. Open-ended writing retains a composition field and model comparison. Duplicate static `Übungen` sections are omitted from the reading navigation; interactive practice appears after the reading sections.
