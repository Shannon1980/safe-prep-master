import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const generated = JSON.parse(readFileSync(join(__dirname, 'generated-questions.json'), 'utf8'));

// Map lessonId+sectionId → exam domain
const LESSON_SECTION_TO_DOMAIN = {
  '1-agile-basics': 'Introducing Scrum in SAFe',
  '1-scrum-basics': 'Introducing Scrum in SAFe',
  '1-agile-team': 'Introducing Scrum in SAFe',
  '2-sm-role': 'Defining the SM/TC Role',
  '2-servant-leadership': 'Defining the SM/TC Role',
  '2-high-performing-teams': 'Defining the SM/TC Role',
  '2-events': 'Defining the SM/TC Role',
  '3-pi-planning': 'Supporting ART Events',
  '3-pi-objectives': 'Supporting ART Events',
  '3-stories-estimation': 'Supporting ART Events',
  '3-backlog': 'Supporting ART Events',
  '4-iteration-planning': 'Supporting Team Events',
  '4-team-sync': 'Supporting Team Events',
  '4-backlog-refinement': 'Supporting Team Events',
  '4-review-retro': 'Supporting Team Events',
  '4-flow-devops': 'Introducing Scrum in SAFe',
  '5-ip-iteration': 'Supporting ART Events',
  '5-inspect-adapt': 'Supporting ART Events',
  '5-improvement': 'Supporting ART Events',
  '6-ai-basics': 'Introducing Scrum in SAFe',
  '6-responsible-ai': 'Introducing Scrum in SAFe',
};

// Read existing exam-questions.ts
const examQFile = join(ROOT, 'data', 'exam-questions.ts');
let examContent = readFileSync(examQFile, 'utf8');

// Read existing lesson-config.ts
const lessonFile = join(ROOT, 'data', 'lesson-config.ts');
let lessonContent = readFileSync(lessonFile, 'utf8');

// Collect existing question texts for dedup
const existingTexts = new Set();
const textMatches = examContent.matchAll(/question:\s*['"`](.+?)['"`]/g);
for (const m of textMatches) existingTexts.add(m[1].toLowerCase().slice(0, 80));
const textMatches2 = lessonContent.matchAll(/question:\s*['"`](.+?)['"`]/g);
for (const m of textMatches2) existingTexts.add(m[1].toLowerCase().slice(0, 80));

// Build new exam questions entries and lesson map entries
const newExamEntries = [];
const newLessonMapEntries = [];
let added = 0;

for (const q of generated) {
  const key = q.question.toLowerCase().slice(0, 80);
  if (existingTexts.has(key)) continue;
  existingTexts.add(key);

  const domainKey = `${q.lessonId}-${q.sectionId}`;
  const domain = LESSON_SECTION_TO_DOMAIN[domainKey] || q.domain || 'Introducing Scrum in SAFe';

  // Escape single quotes in question and options
  const escQ = q.question.replace(/'/g, "\\'");
  const escOpts = q.options.map(o => o.replace(/'/g, "\\'"));

  newExamEntries.push(
    `  { id: '${q.id}', question: '${escQ}', options: ['${escOpts.join("', '")}'], correctIndex: ${q.correctIndex}, domain: '${domain}' },`
  );

  newLessonMapEntries.push(
    `  '${q.id}': { lesson: ${q.lessonId}, section: '${q.sectionId}' },`
  );

  added++;
}

console.log(`Adding ${added} new questions (${generated.length - added} skipped as duplicates)`);

// Insert new questions into EXAM_QUESTIONS array (before the closing ];)
const examArrayEnd = examContent.lastIndexOf('];');
if (examArrayEnd === -1) {
  console.error('Could not find end of EXAM_QUESTIONS array');
  process.exit(1);
}

const genComment = '\n\n  // ── AI-Generated Questions (SAFe 6.0 SSM Exam Prep) ──\n';
examContent = examContent.slice(0, examArrayEnd) + genComment + newExamEntries.join('\n') + '\n' + examContent.slice(examArrayEnd);
writeFileSync(examQFile, examContent);
console.log('Updated exam-questions.ts');

// Insert new lesson map entries into EXAM_QUESTION_LESSON_MAP (before closing };)
const mapEnd = lessonContent.indexOf('};', lessonContent.indexOf('EXAM_QUESTION_LESSON_MAP'));
if (mapEnd === -1) {
  console.error('Could not find end of EXAM_QUESTION_LESSON_MAP');
  process.exit(1);
}

const genMapComment = '\n\n  // AI-Generated Questions\n';
lessonContent = lessonContent.slice(0, mapEnd) + genMapComment + newLessonMapEntries.join('\n') + '\n' + lessonContent.slice(mapEnd);
writeFileSync(lessonFile, lessonContent);
console.log('Updated lesson-config.ts');

console.log('\nDone! Run `npx next build` to verify.');
