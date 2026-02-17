import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = join(__dirname, '..', 'data', 'exam-questions.ts');

let content = readFileSync(filePath, 'utf8');

// Strategy: find all lines with gen- questions and extract them
const lines = content.split('\n');
const genLines = [];
const nonGenLines = [];
let inGenBlock = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes("id: 'gen-L") || line.includes("id: 'gen-L5-ia-")) {
    genLines.push(line);
  } else if (line.trim() === "const GENERATED_QUESTIONS_PLACEHOLDER = true; // marker to be removed") {
    // skip this line
  } else {
    nonGenLines.push(line);
  }
}

console.log(`Extracted ${genLines.length} generated question lines`);
console.log(`Remaining lines: ${nonGenLines.length}`);

// Reconstruct the file
let rebuilt = nonGenLines.join('\n');

// Fix the selectExamQuestions function - remove any dangling brackets
// The line `const questions = byDomain.get(domain) || [];` might have artifacts
rebuilt = rebuilt.replace(
  /const questions = byDomain\.get\(domain\) \|\| \[\];\n\s*\];\n/g,
  'const questions = byDomain.get(domain) || [];\n'
);

// Also clean up any empty lines left after extraction
rebuilt = rebuilt.replace(/\n{4,}/g, '\n\n');

// Now find where to insert the generated questions - right before the `];` that closes EXAM_QUESTIONS
// The array closing is after the lnf-44 line
const insertMarker = "  { id: 'lnf-44'";
const insertIdx = rebuilt.indexOf(insertMarker);
if (insertIdx === -1) {
  console.error('Cannot find lnf-44 to locate EXAM_QUESTIONS end');
  process.exit(1);
}

// Find the newline after lnf-44 line
const endOfLnf44 = rebuilt.indexOf('\n', insertIdx);
const afterLnf44 = rebuilt.indexOf('];', endOfLnf44);

if (afterLnf44 === -1) {
  console.error('Cannot find ]; after lnf-44');
  process.exit(1);
}

const genComment = '\n\n  // ── AI-Generated Questions (SAFe 6.0 SSM Exam Prep) ──\n';
const genBlock = genComment + genLines.join('\n') + '\n';

rebuilt = rebuilt.slice(0, afterLnf44) + genBlock + rebuilt.slice(afterLnf44);

writeFileSync(filePath, rebuilt);
console.log('File fixed! Verifying...');

// Verify
const final = readFileSync(filePath, 'utf8');
const examArrayStart = final.indexOf('export const EXAM_QUESTIONS');
const genQStart = final.indexOf("gen-L1-1");
const examArrayEnd = final.indexOf('];', genQStart);
const selectFnStart = final.indexOf('export function selectExamQuestions');

console.log(`EXAM_QUESTIONS starts at: ${examArrayStart}`);
console.log(`gen-L1-1 at: ${genQStart}`);
console.log(`]; after gen questions at: ${examArrayEnd}`);
console.log(`selectExamQuestions at: ${selectFnStart}`);
console.log(`Correct placement: ${examArrayEnd < selectFnStart}`);

// Count total questions in the array
const match = final.match(/{ id: '/g);
console.log(`Total question entries: ${match ? match.length : 0}`);
