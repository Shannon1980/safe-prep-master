import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'data', 'exam-questions.ts');

let content = readFileSync(filePath, 'utf8');

// Find the generated questions block - they start with the comment and end with gen-L5-ia-17
const genStartMarker = "  // ── AI-Generated Questions (SAFe 6.0 SSM Exam Prep) ──\n";
const genEndId = "gen-L5-ia-17";

const genStartIdx = content.indexOf(genStartMarker);
if (genStartIdx === -1) {
  console.log('Generated questions comment not found, checking if questions exist differently...');
  process.exit(1);
}

// Find the line after gen-L5-ia-17
const genEndLineIdx = content.indexOf(genEndId);
const genEndNewline = content.indexOf('\n', content.indexOf('},', genEndLineIdx));

// Extract the generated questions block
const genBlock = content.slice(genStartIdx, genEndNewline + 1);
console.log(`Found generated block: ${genBlock.length} chars, starts at index ${genStartIdx}`);

// Count questions in the block
const genCount = (genBlock.match(/\{ id: 'gen-/g) || []).length;
console.log(`Contains ${genCount} generated questions`);

// Remove the generated block from its current wrong location
// Also remove the stray ]; and placeholder that were left
content = content.slice(0, genStartIdx) + content.slice(genEndNewline + 1);

// Clean up any artifacts left from the wrong placement
content = content.replace(/\n];\n\n\/\/ This block of generated questions.*?\n.*?marker to be removed\n\n/s, '\n');

// Also fix the selectExamQuestions function - remove the stray `];` if it's still there
// The function should have: `const questions = byDomain.get(domain) || [];`
// not `const questions = byDomain.get(domain) || [`
content = content.replace(
  /const questions = byDomain\.get\(domain\) \|\| \[\];?\s*\n\s*const shuffled/,
  'const questions = byDomain.get(domain) || [];\n    const shuffled'
);

// Now insert the generated questions in the correct place: right before the closing `];` of EXAM_QUESTIONS
// The EXAM_QUESTIONS array ends with the lnf-44 question followed by ];
const examArrayEndMarker = "  { id: 'lnf-44'";
const lnf44Idx = content.indexOf(examArrayEndMarker);
if (lnf44Idx === -1) {
  console.error('Could not find lnf-44 marker');
  process.exit(1);
}

// Find the end of the lnf-44 line
const lnf44End = content.indexOf('\n', lnf44Idx);
// Find the ];
const closingBracket = content.indexOf('];', lnf44End);

if (closingBracket === -1) {
  console.error('Could not find closing ]; for EXAM_QUESTIONS');
  process.exit(1);
}

// Insert the generated questions before ];
content = content.slice(0, closingBracket) + '\n' + genBlock + content.slice(closingBracket);

writeFileSync(filePath, content);
console.log('Fixed! Generated questions moved to EXAM_QUESTIONS array.');

// Verify
const finalContent = readFileSync(filePath, 'utf8');
const examArrayMatch = finalContent.match(/export const EXAM_QUESTIONS: ExamQuestion\[\] = \[/);
const genInArray = finalContent.indexOf("gen-L1-1");
const arrayClose = finalContent.indexOf('];', genInArray);
const selectFnStart = finalContent.indexOf('export function selectExamQuestions');
console.log(`gen-L1-1 at index ${genInArray}`);
console.log(`Array close at index ${arrayClose}`);
console.log(`selectExamQuestions at index ${selectFnStart}`);
console.log(`Questions correctly inside array: ${arrayClose < selectFnStart}`);
