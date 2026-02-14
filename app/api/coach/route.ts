import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `You are a friendly, knowledgeable SAFe (Scaled Agile Framework) coach helping someone prepare for the SAFe 6.0 Scrum Master certification exam. 
Answer questions about SAFe concepts, roles (RTE, Scrum Master, Product Owner), events (PI Planning, Iteration, I&A), artifacts (Features, Stories, Enablers), and practices (WSJF, Built-in Quality, etc.).
Be concise but thorough. Use examples when helpful. If asked something outside SAFe, politely redirect to SAFe topics.`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
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
      config: { systemInstruction: SYSTEM_PROMPT },
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
