import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb, getFirebaseAuth } from './firebase';

export interface StudyDocument {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

const LOCAL_STORAGE_KEY = 'safe-prep-study-content';

function getLocalDocs(): StudyDocument[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalDocs(docs: StudyDocument[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(docs));
}

function getUid(): string | null {
  const auth = getFirebaseAuth();
  return auth?.currentUser?.uid ?? null;
}

function getUserCollection() {
  const db = getFirebaseDb();
  const uid = getUid();
  if (!db || !uid) return null;
  return collection(db, 'users', uid, 'studyContent');
}

export async function addStudyDocument(
  title: string,
  content: string
): Promise<StudyDocument> {
  const docData: StudyDocument = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: Date.now(),
  };

  const col = getUserCollection();
  if (col) {
    try {
      const ref = await addDoc(col, {
        title,
        content,
        createdAt: serverTimestamp(),
      });
      docData.id = ref.id;
    } catch (err) {
      console.warn('Firestore write failed, falling back to localStorage:', err);
    }
  }

  const local = getLocalDocs();
  local.push(docData);
  saveLocalDocs(local);

  return docData;
}

export async function getStudyDocuments(): Promise<StudyDocument[]> {
  const col = getUserCollection();
  if (col) {
    try {
      const q = query(col, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          title: d.data().title,
          content: d.data().content,
          createdAt: d.data().createdAt?.toMillis?.() ?? Date.now(),
        }));
        saveLocalDocs(docs);
        return docs;
      }
    } catch (err) {
      console.warn('Firestore read failed, falling back to localStorage:', err);
    }
  }

  return getLocalDocs().sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteStudyDocument(id: string): Promise<void> {
  const col = getUserCollection();
  if (col) {
    try {
      await deleteDoc(doc(col.firestore, col.path, id));
    } catch (err) {
      console.warn('Firestore delete failed:', err);
    }
  }

  const local = getLocalDocs().filter((d) => d.id !== id);
  saveLocalDocs(local);
}

export async function getAllStudyContent(): Promise<string> {
  const docs = await getStudyDocuments();
  if (docs.length === 0) return '';
  return docs.map((d) => `--- ${d.title} ---\n${d.content}`).join('\n\n');
}

export function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
