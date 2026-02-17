import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from './firebase';

// ── Types ──

export interface PresenceRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  currentPage: string;
  activity: string;
  lastSeen: Date | Timestamp;
}

// ── Page-to-activity mapping ──

const PAGE_ACTIVITY_MAP: [RegExp, string][] = [
  [/^\/exam/, 'Taking Exam'],
  [/^\/quiz\/lesson/, 'Lesson Quiz'],
  [/^\/quiz/, 'Practice Quiz'],
  [/^\/flashcards/, 'Flashcards'],
  [/^\/coach/, 'AI Coach'],
  [/^\/upload/, 'Uploading Materials'],
  [/^\/progress/, 'Viewing Progress'],
  [/^\/admin/, 'Admin Dashboard'],
  [/^\/$/, 'Home'],
];

export function getActivityLabel(pathname: string): string {
  for (const [pattern, label] of PAGE_ACTIVITY_MAP) {
    if (pattern.test(pathname)) return label;
  }
  return 'Browsing';
}

// ── Presence Operations ──

export async function updatePresence(pathname: string): Promise<void> {
  const db = getFirebaseDb();
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!db || !user) return;

  try {
    await setDoc(doc(db, 'presence', user.uid), {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      currentPage: pathname,
      activity: getActivityLabel(pathname),
      lastSeen: Timestamp.now(),
    });
  } catch (error) {
    console.error('Failed to update presence:', error);
  }
}

export async function removePresence(): Promise<void> {
  const db = getFirebaseDb();
  const auth = getFirebaseAuth();
  const user = auth?.currentUser;
  if (!db || !user) return;

  try {
    await deleteDoc(doc(db, 'presence', user.uid));
  } catch (error) {
    console.error('Failed to remove presence:', error);
  }
}

// ── Real-time subscription (for admin) ──

const STALE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

export function subscribeToPresence(
  callback: (users: PresenceRecord[]) => void
): Unsubscribe | null {
  const db = getFirebaseDb();
  if (!db) return null;

  return onSnapshot(collection(db, 'presence'), (snapshot) => {
    const now = Date.now();
    const users: PresenceRecord[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const lastSeen = data.lastSeen?.toDate?.() ?? new Date(0);
      if (now - lastSeen.getTime() > STALE_THRESHOLD_MS) continue;

      users.push({
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        currentPage: data.currentPage,
        activity: data.activity,
        lastSeen,
      });
    }

    callback(users);
  });
}

// ── Heartbeat ──

let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let currentPath = '/';

export function startHeartbeat(pathname: string): void {
  currentPath = pathname;

  if (heartbeatInterval) return;
  heartbeatInterval = setInterval(() => {
    updatePresence(currentPath);
  }, 60_000);
}

export function updateHeartbeatPath(pathname: string): void {
  currentPath = pathname;
}

export function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}
