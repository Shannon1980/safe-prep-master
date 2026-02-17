import { GoogleGenAI } from '@google/genai';

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

const COACH_SYSTEM_PROMPT = `You are a friendly, knowledgeable SAFe (Scaled Agile Framework) coach helping someone prepare for the SAFe 6.0 Scrum Master certification exam. 
Answer questions about SAFe concepts, roles (RTE, Scrum Master, Product Owner), events (PI Planning, Iteration, I&A), artifacts (Features, Stories, Enablers), and practices (WSJF, Built-in Quality, etc.).
Be concise but thorough. Use examples when helpful. If asked something outside SAFe, politely redirect to SAFe topics.`;

function buildCoachPrompt(context?: string): string {
  if (!context || !context.trim()) return COACH_SYSTEM_PROMPT;
  const trimmed = context.length > 30000 ? context.slice(0, 30000) + '\n...(truncated)' : context;
  return `${COACH_SYSTEM_PROMPT}

The user has uploaded the following study materials. Reference them when answering questions and use them to provide more specific, relevant answers:

<study_materials>
${trimmed}
</study_materials>`;
}

export function isGeminiConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}

export async function chatWithCoach(
  message: string,
  context?: string
): Promise<string> {
  const ai = getClient();
  if (!ai) {
    return "I'd love to help, but the AI coach isn't configured yet. Add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: message,
      config: { systemInstruction: buildCoachPrompt(context) },
    });
    return response.text ?? 'I could not generate a response. Please try again.';
  } catch (error) {
    console.error('AI Coach error:', error);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

export async function explainQuestion(
  question: string,
  options: string[],
  correctIndex: number,
  selectedIndex: number | null
): Promise<string> {
  const ai = getClient();
  if (!ai) {
    return 'AI explanations require NEXT_PUBLIC_GEMINI_API_KEY to be configured.';
  }

  const correctAnswer = options[correctIndex];
  const userAnswer = selectedIndex !== null ? options[selectedIndex] : null;
  const wasCorrect = selectedIndex === correctIndex;

  const prompt = `You are a SAFe certification tutor. Explain this quiz question and answer in 2-3 sentences, in a friendly, educational tone.

Question: ${question}
Correct answer: ${correctAnswer}
${userAnswer && !wasCorrect ? `The user selected: ${userAnswer} (incorrect).` : ''}

Explain why the correct answer is right${!wasCorrect && userAnswer ? ' and why the selected answer was wrong' : ''}.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    return response.text ?? 'Could not generate explanation.';
  } catch (error) {
    console.error('Explain error:', error);
    return 'Unable to generate explanation. Please try again.';
  }
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

export async function generateQuizFromContent(
  content: string,
  count: number = 10
): Promise<{ questions?: GeneratedQuestion[]; error?: string }> {
  const ai = getClient();
  if (!ai) {
    return { error: 'AI quiz generation requires NEXT_PUBLIC_GEMINI_API_KEY to be configured.' };
  }

  const trimmed = content.length > 30000 ? content.slice(0, 30000) : content;
  const questionCount = Math.min(Math.max(count, 3), 15);

  const prompt = `Based on the following study material, generate exactly ${questionCount} multiple-choice quiz questions to test the reader's knowledge.

Requirements:
- Each question should have exactly 4 options
- Only one option should be correct
- Vary the position of the correct answer (don't always put it first)
- Questions should test understanding, not just memorization
- Cover different topics from the material
- Make incorrect options plausible but clearly wrong

Return ONLY a valid JSON array with no other text. Each element must have this exact structure:
{
  "question": "the question text",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0,
  "topic": "short topic label"
}

Study Material:
${trimmed}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text ?? '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return { error: 'Failed to generate valid quiz questions. Please try again.' };
    }

    const questions = JSON.parse(jsonMatch[0]);
    const validated: GeneratedQuestion[] = questions
      .filter(
        (q: Record<string, unknown>) =>
          q.question &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correctIndex === 'number' &&
          q.correctIndex >= 0 &&
          q.correctIndex <= 3
      )
      .map((q: Record<string, unknown>, i: number) => ({
        id: `gen-${i + 1}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        topic: q.topic || 'General',
      }));

    if (validated.length === 0) {
      return { error: 'Could not generate valid questions. Try uploading more detailed material.' };
    }

    return { questions: validated };
  } catch (error) {
    console.error('Generate quiz error:', error);
    return { error: 'Failed to generate quiz. Please try again.' };
  }
}
