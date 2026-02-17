import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync } from 'fs';

const ai = new GoogleGenAI({ apiKey: 'AIzaSyAHDDkPbJl0FVVsenO5sjovPikWSymJG4M' });

const prompt = `You are an expert SAFe 6.0 Scrum Master certification exam question writer.

Generate exactly 17 unique, challenging multiple-choice questions for the SAFe Scrum Master 6.0 certification exam.

LESSON: Finishing the PI
SECTION: Inspect & Adapt
EXAM DOMAIN: Supporting ART Events

Key concepts to test:
- Three parts: PI System Demo, Quantitative/Qualitative Measurement, Problem-Solving Workshop
- Pareto analysis identifies the biggest root cause
- 5 Whys and Fishbone diagrams for root cause analysis
- ART predictability: planned business value vs actual business value achieved
- SM supports by providing facilitation to breakout groups focused on specific problems

REQUIREMENTS:
- Each question MUST have exactly 4 answer options
- Exactly ONE correct answer per question
- Vary the position of the correct answer across questions
- Questions should test APPLICATION of knowledge not just recall
- Include scenario-based questions where appropriate
- Use official SAFe 6.0 terminology

Return ONLY a valid JSON array. Each element:
{"question": "the question text", "options": ["A", "B", "C", "D"], "correctIndex": 0}

No markdown, no explanation, just the JSON array.`;

async function main() {
  const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
  const text = response.text || '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error('No JSON found. Raw text:', text.slice(0, 500));
    return;
  }
  const questions = JSON.parse(jsonMatch[0]);
  const mapped = questions
    .filter(q => q.question && Array.isArray(q.options) && q.options.length === 4 && typeof q.correctIndex === 'number')
    .map((q, i) => ({
      ...q,
      id: `gen-L5-ia-${i + 1}`,
      lessonId: 5,
      sectionId: 'inspect-adapt',
      domain: 'Supporting ART Events',
    }));

  const existing = JSON.parse(readFileSync('scripts/generated-questions.json', 'utf8'));
  existing.push(...mapped);
  writeFileSync('scripts/generated-questions.json', JSON.stringify(existing, null, 2));
  console.log(`Added ${mapped.length} questions. Total: ${existing.length}`);
}

main().catch(console.error);
