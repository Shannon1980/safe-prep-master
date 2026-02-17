import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from './firebase';
import { EXAM_QUESTIONS, type ExamQuestion, type ExamDomain } from '../../data/exam-questions';
import { QUIZ_QUESTIONS } from '../../data/quiz-questions';
import { getLessonQuestions, type LessonQuizQuestion } from '../../data/lesson-config';

// ── Types ──

export interface FirestoreQuestion {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  correctIndices?: number[];
  multiSelect?: number;
  domain: string;
  lessonId: number;
  sectionId: string;
  enabled: boolean;
  createdBy: string;
  createdAt: Date | Timestamp;
}

// ── In-memory cache ──

let cachedQuestions: FirestoreQuestion[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ── Firestore CRUD ──

export async function fetchFirestoreQuestions(): Promise<FirestoreQuestion[]> {
  // Return cache if fresh
  if (cachedQuestions && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedQuestions;
  }

  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(collection(db, 'questions'), where('enabled', '==', true));
    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as FirestoreQuestion[];

    cachedQuestions = questions;
    cacheTimestamp = Date.now();
    return questions;
  } catch (error) {
    console.error('Failed to fetch Firestore questions:', error);
    return [];
  }
}

export async function fetchAllFirestoreQuestions(): Promise<FirestoreQuestion[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const snapshot = await getDocs(collection(db, 'questions'));
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
    })) as FirestoreQuestion[];
  } catch (error) {
    console.error('Failed to fetch all Firestore questions:', error);
    return [];
  }
}

export async function addFirestoreQuestion(
  data: Omit<FirestoreQuestion, 'id' | 'createdAt' | 'createdBy'>
): Promise<string | null> {
  const db = getFirebaseDb();
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!db || !user) return null;

  try {
    const docRef = await addDoc(collection(db, 'questions'), {
      ...data,
      createdBy: user.email || '',
      createdAt: Timestamp.now(),
    });
    cachedQuestions = null; // invalidate cache
    return docRef.id;
  } catch (error) {
    console.error('Failed to add question:', error);
    return null;
  }
}

export async function updateFirestoreQuestion(
  questionId: string,
  data: Partial<Omit<FirestoreQuestion, 'id' | 'createdAt' | 'createdBy'>>
): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    await updateDoc(doc(db, 'questions', questionId), data);
    cachedQuestions = null; // invalidate cache
    return true;
  } catch (error) {
    console.error('Failed to update question:', error);
    return false;
  }
}

export async function deleteFirestoreQuestion(questionId: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    await deleteDoc(doc(db, 'questions', questionId));
    cachedQuestions = null; // invalidate cache
    return true;
  } catch (error) {
    console.error('Failed to delete question:', error);
    return false;
  }
}

// ── Merged pools ──

const TOPIC_TO_DOMAIN: Record<string, ExamDomain> = {
  'Lesson 1 – Agile Basics': 'Introducing Scrum in SAFe',
  'Lesson 1 – Scrum Basics': 'Introducing Scrum in SAFe',
  'Lesson 1 – Agile Team': 'Introducing Scrum in SAFe',
  'Lesson 2 – SM Role': 'Defining the SM/TC Role',
  'Lesson 2 – Events': 'Defining the SM/TC Role',
  'Lesson 2 – High-Performing Teams': 'Defining the SM/TC Role',
  'Lesson 3 – PI Planning': 'Supporting ART Events',
  'Lesson 3 – Features': 'Supporting ART Events',
  'Lesson 4 – Iteration Planning': 'Supporting Team Events',
  'Lesson 4 – Team Sync': 'Supporting Team Events',
  'Lesson 4 – Backlog Refinement': 'Supporting Team Events',
  'Lesson 4 – Iteration Review': 'Supporting Team Events',
  'Lesson 4 – Retrospective': 'Supporting Team Events',
  'Lesson 4 – DevOps': 'Introducing Scrum in SAFe',
  'Lesson 4 – Flow': 'Supporting Team Events',
  'Lesson 4 – Commitment': 'Supporting Team Events',
  'Lesson 5 – IP Iteration': 'Supporting ART Events',
  'Lesson 5 – Inspect & Adapt': 'Supporting ART Events',
  'Lesson 6 – AI for SMs': 'Introducing Scrum in SAFe',
  Roles: 'Defining the SM/TC Role',
  Prioritization: 'Introducing Scrum in SAFe',
};

/**
 * Build the full exam pool: hardcoded + Firestore questions, deduplicated.
 */
export async function getFullExamPool(): Promise<ExamQuestion[]> {
  const firestoreQs = await fetchFirestoreQuestions();
  const pool: ExamQuestion[] = [...EXAM_QUESTIONS];
  const seen = new Set(EXAM_QUESTIONS.map((q) => q.question.toLowerCase().slice(0, 80)));

  // Add practice quiz questions
  for (const q of QUIZ_QUESTIONS) {
    const key = q.question.toLowerCase().slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    const domain = TOPIC_TO_DOMAIN[q.topic];
    if (!domain) continue;
    pool.push({
      id: `pq-${q.id}`,
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      domain,
    });
  }

  // Add Firestore questions
  for (const q of firestoreQs) {
    const key = q.question.toLowerCase().slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    pool.push({
      id: `fs-${q.id}`,
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      correctIndices: q.correctIndices,
      multiSelect: q.multiSelect,
      domain: q.domain as ExamDomain,
    });
  }

  return pool;
}

/**
 * Build the full lesson pool: hardcoded + Firestore questions for a lesson.
 */
export async function getFullLessonPool(lessonId: number): Promise<LessonQuizQuestion[]> {
  const hardcoded = getLessonQuestions(lessonId);
  const firestoreQs = await fetchFirestoreQuestions();

  const seen = new Set(hardcoded.map((q) => q.question.toLowerCase().slice(0, 80)));
  const result: LessonQuizQuestion[] = [...hardcoded];

  for (const q of firestoreQs) {
    if (q.lessonId !== lessonId) continue;
    const key = q.question.toLowerCase().slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      id: `fs-${q.id}`,
      question: q.question,
      options: [...q.options],
      correctIndex: q.correctIndex,
      correctIndices: q.correctIndices,
      multiSelect: q.multiSelect,
      section: q.sectionId,
      source: 'exam',
    });
  }

  return result.sort(() => Math.random() - 0.5);
}

/**
 * Invalidate the cached Firestore questions (e.g. after admin add/edit).
 */
export function invalidateQuestionCache(): void {
  cachedQuestions = null;
  cacheTimestamp = 0;
}
