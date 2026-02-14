import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { question, options, correctIndex, selectedIndex } = await req.json();
    if (!question || !options || correctIndex === undefined) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          explanation:
            'Add GEMINI_API_KEY to your .env.local for AI explanations. Get a free key at https://aistudio.google.com/apikey',
        },
        { status: 200 }
      );
    }

    const correctAnswer = options[correctIndex];
    const userAnswer = selectedIndex !== undefined ? options[selectedIndex] : null;
    const wasCorrect = selectedIndex === correctIndex;

    const prompt = `You are a SAFe certification tutor. Explain this quiz question and answer in 2-3 sentences, in a friendly, educational tone.

Question: ${question}
Correct answer: ${correctAnswer}
${userAnswer && !wasCorrect ? `The user selected: ${userAnswer} (incorrect).` : ''}

Explain why the correct answer is right${!wasCorrect && userAnswer ? ' and why the selected answer was wrong' : ''}.`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const explanation = response.text ?? 'Could not generate explanation.';
    return NextResponse.json({ explanation });
  } catch (error) {
    console.error('Explain API error:', error);
    return NextResponse.json(
      { explanation: 'Unable to generate explanation. Please try again.' },
      { status: 200 }
    );
  }
}
