import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from './firebase';

// ── Types ──

export type ActivityType = 'exam' | 'lesson_quiz' | 'practice_quiz' | 'flashcard_session';

export interface ActivityRecord {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  type: ActivityType;
  score: number;
  total: number;
  percentage: number;
  passed?: boolean;
  timeTakenSeconds?: number;
  lessonId?: number;
  lessonTitle?: string;
  quizMode?: string;
  domainBreakdown?: Record<string, { correct: number; total: number }>;
  sectionBreakdown?: { section: string; correct: number; total: number; percentage: number }[];
  createdAt: Date | Timestamp;
}

// ── Save Activity ──

export async function saveActivity(
  data: Omit<ActivityRecord, 'uid' | 'email' | 'displayName' | 'createdAt' | 'id'>
): Promise<void> {
  const db = getFirebaseDb();
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!db || !user) return;

  try {
    await addDoc(collection(db, 'activity'), {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      ...data,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Failed to save activity:', error);
  }
}

// ── User Queries ──

export async function getMyActivity(maxResults = 200): Promise<ActivityRecord[]> {
  const db = getFirebaseDb();
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!db || !user) return [];

  try {
    const q = query(
      collection(db, 'activity'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
    })) as ActivityRecord[];
  } catch (error) {
    console.error('Failed to fetch user activity:', error);
    return [];
  }
}

// ── Admin Queries ──

export async function getAllActivity(maxResults = 500): Promise<ActivityRecord[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, 'activity'),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
    })) as ActivityRecord[];
  } catch (error) {
    console.error('Failed to fetch activity:', error);
    return [];
  }
}

export async function getActivityByType(
  type: ActivityType,
  maxResults = 200
): Promise<ActivityRecord[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const q = query(
      collection(db, 'activity'),
      where('type', '==', type),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ?? new Date(),
    })) as ActivityRecord[];
  } catch (error) {
    console.error('Failed to fetch activity by type:', error);
    return [];
  }
}

// ── Admin Check ──

const ADMIN_EMAILS = [
  'shannongueringer@govorentoe.com',
  'shannongueringer@gmail.com',
  'shannon.gueringer@gmail.com',
  'shannon@govorentoe.com',
];

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
