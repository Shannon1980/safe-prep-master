import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { content, count = 10 } = await req.json();
    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Study content is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Add GEMINI_API_KEY to your .env.local to generate quizzes. Get a free key at https://aistudio.google.com/apikey',
        },
        { status: 200 }
      );
    }

    const trimmedContent = content.length > 30000 ? content.slice(0, 30000) : content;
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
${trimmedContent}`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const text = response.text ?? '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Failed to generate valid quiz questions. Please try again.' },
        { status: 500 }
      );
    }

    const questions = JSON.parse(jsonMatch[0]);

    const validated = questions
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
      return NextResponse.json(
        { error: 'Could not generate valid questions from the content. Try uploading more detailed material.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: validated });
  } catch (error) {
    console.error('Generate quiz error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    );
  }
}
