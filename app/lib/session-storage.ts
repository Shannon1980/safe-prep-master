import type { ExamQuestion } from '@/data/exam-questions';
import type { LessonQuizQuestion } from '@/data/lesson-config';
import type { QuizQuestion } from '@/data/quiz-questions';

// ── Session types ──

export interface ExamSession {
  type: 'exam';
  questions: ExamQuestion[];
  questionStates: { selectedAnswer: number | null; selectedAnswers: number[]; flagged: boolean }[];
  currentIndex: number;
  timeRemaining: number;
  savedAt: number;
}

export interface LessonQuizSession {
  type: 'lesson_quiz';
  lessonId: number;
  questions: LessonQuizQuestion[];
  answerStates: { selectedAnswer: number | null; selectedAnswers: number[]; answered: boolean }[];
  currentIndex: number;
  savedAt: number;
}

export interface PracticeQuizSession {
  type: 'practice_quiz';
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  mode: string;
  savedAt: number;
}

type Session = ExamSession | LessonQuizSession | PracticeQuizSession;

// ── Storage keys ──

const KEYS = {
  exam: 'safe-prep-session-exam',
  lesson_quiz: 'safe-prep-session-lesson-quiz',
  practice_quiz: 'safe-prep-session-practice-quiz',
} as const;

// ── Max age: 24 hours ──

const MAX_AGE_MS = 24 * 60 * 60 * 1000;

// ── Operations ──

export function saveSession<T extends Session>(session: T): void {
  try {
    const key = KEYS[session.type];
    localStorage.setItem(key, JSON.stringify({ ...session, savedAt: Date.now() }));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

export function loadSession<T extends Session>(type: T['type']): T | null {
  try {
    const raw = localStorage.getItem(KEYS[type]);
    if (!raw) return null;
    const session = JSON.parse(raw) as T;
    if (Date.now() - session.savedAt > MAX_AGE_MS) {
      clearSession(type);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(type: Session['type']): void {
  try {
    localStorage.removeItem(KEYS[type]);
  } catch {
    // ignore
  }
}

export function formatTimeSince(savedAt: number): string {
  const diff = Date.now() - savedAt;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return 'over a day ago';
}
