import { GoogleGenAI } from '@google/genai';

export function parseExplanation(text: string): { segments: { type: 'text' | 'bold' | 'link'; value: string; href?: string }[] } {
  const segments: { type: 'text' | 'bold' | 'link'; value: string; href?: string }[] = [];
  const pattern = /(\*\*(.+?)\*\*)|(https?:\/\/[^\s)<]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    if (match[1]) {
      segments.push({ type: 'bold', value: match[2] });
    } else if (match[3]) {
      segments.push({ type: 'link', value: match[3], href: match[3] });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return { segments };
}

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
      model: 'gemini-2.5-flash-lite',
      contents: message,
      config: { systemInstruction: buildCoachPrompt(context) },
    });
    return response.text ?? 'I could not generate a response. Please try again.';
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('AI Coach error:', msg, error);
    if (msg.includes('API key')) {
      return 'The AI API key appears to be invalid. Please check your Gemini API key configuration.';
    }
    if (msg.includes('quota') || msg.includes('429')) {
      return 'The AI service is temporarily rate-limited. Please wait a moment and try again.';
    }
    if (msg.includes('404') || msg.includes('not found')) {
      return 'The AI model is temporarily unavailable. Please try again in a moment.';
    }
    return `Sorry, I encountered an error: ${msg}. Please try again.`;
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

  const prompt = `You are a SAFe 6.0 certification tutor. Explain this quiz question and answer in a friendly, educational tone.

Question: ${question}
Correct answer: ${correctAnswer}
${userAnswer && !wasCorrect ? `The user selected: ${userAnswer} (incorrect).` : ''}

Your response MUST include ALL of the following sections:

1. **Explanation** (2-3 sentences): Why the correct answer is right${!wasCorrect && userAnswer ? ' and why the selected answer was wrong' : ''}.

2. **SAFe Reference**: Name the specific SAFe concept, principle, practice, or competency this relates to (e.g., "SAFe Principle #4 – Build Incrementally", "PI Planning", "Team Backlog", "Lean-Agile Leadership", etc.).

3. **Learn More**: Provide a direct link to the relevant page on the official SAFe website. Use this format:
   - For general SAFe concepts: https://scaledagileframework.com/<topic-slug>
   - Common pages include: /safe-scrum-master, /pi-planning, /iteration-execution, /team-backlog, /product-owner, /safe-lean-agile-principles, /built-in-quality, /wsjf, /inspect-and-adapt, /agile-release-train, /continuous-delivery-pipeline, /devops, /lean-agile-leadership, /art-events, /iteration-planning, /iteration-review, /scrum-master, /features-and-capabilities, /story, /enablers, /program-increment, /safe-team-kanban, /system-demo, /release-on-demand, /continuous-exploration, /solution-train, /lean-portfolio-management
   - Only use real scaledagileframework.com URLs. If unsure of the exact slug, use https://scaledagileframework.com/ as the base and your best guess for the path.

Format your response clearly with the section headers bolded using ** markers.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });
    return response.text ?? 'Could not generate explanation.';
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Explain error:', msg, error);
    if (msg.includes('leaked') || msg.includes('API key') || msg.includes('403')) {
      return 'The AI API key needs to be updated. Please contact the administrator.';
    }
    if (msg.includes('quota') || msg.includes('429')) {
      return 'The AI service is temporarily rate-limited. Please wait a moment and try again.';
    }
    return `Unable to generate explanation: ${msg}`;
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
      model: 'gemini-2.5-flash-lite',
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Generate quiz error:', msg, error);
    if (msg.includes('leaked') || msg.includes('API key') || msg.includes('403')) {
      return { error: 'The AI API key needs to be updated. Please contact the administrator.' };
    }
    return { error: `Failed to generate quiz: ${msg}` };
  }
}
