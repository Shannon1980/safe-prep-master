import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const BASE_SYSTEM_PROMPT = `You are a friendly, knowledgeable SAFe (Scaled Agile Framework) coach helping someone prepare for the SAFe 6.0 Scrum Master certification exam. 
Answer questions about SAFe concepts, roles (RTE, Scrum Master, Product Owner), events (PI Planning, Iteration, I&A), artifacts (Features, Stories, Enablers), and practices (WSJF, Built-in Quality, etc.).
Be concise but thorough. Use examples when helpful. If asked something outside SAFe, politely redirect to SAFe topics.`;

function buildSystemPrompt(context?: string): string {
  if (!context || !context.trim()) return BASE_SYSTEM_PROMPT;

  const trimmedContext = context.length > 30000 ? context.slice(0, 30000) + '\n...(truncated)' : context;

  return `${BASE_SYSTEM_PROMPT}

The user has uploaded the following study materials. Reference them when answering questions and use them to provide more specific, relevant answers:

<study_materials>
${trimmedContext}
</study_materials>`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          reply: "I'd love to help, but the AI coach isn't configured yet. Add GEMINI_API_KEY or GOOGLE_API_KEY to your .env.local file. Get a free API key at https://aistudio.google.com/apikey",
        },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: message,
      config: { systemInstruction: buildSystemPrompt(context) },
    });

    const text = response.text ?? 'I could not generate a response. Please try again.';
    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error('AI Coach error:', error);
    return NextResponse.json(
      {
        reply: "Sorry, I encountered an error. Please check that your API key is valid and try again.",
      },
      { status: 200 }
    );
  }
}
