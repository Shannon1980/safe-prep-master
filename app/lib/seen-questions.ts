/**
 * Tracks recently seen question IDs per section in localStorage.
 * Allows quiz selection to prioritize unseen questions, reducing repeats.
 */

const STORAGE_KEY = 'safe-prep-seen-questions';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_IDS_PER_ENTRY = 30;

interface SeenEntry {
  ids: string[];
  updatedAt: number;
}

type SeenData = Record<string, SeenEntry>;

function buildKey(lessonId: number, sectionId: string): string {
  return `lesson-${lessonId}-section-${sectionId}`;
}

function loadData(): SeenData {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as SeenData;

    // Prune expired entries
    const now = Date.now();
    let pruned = false;
    for (const key of Object.keys(data)) {
      if (now - data[key].updatedAt > TTL_MS) {
        delete data[key];
        pruned = true;
      }
    }
    if (pruned) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    return data;
  } catch {
    return {};
  }
}

function saveData(data: SeenData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

/**
 * Get the IDs of recently seen questions for a given lesson section.
 */
export function getSeenQuestionIds(lessonId: number, sectionId: string): string[] {
  const data = loadData();
  const entry = data[buildKey(lessonId, sectionId)];
  return entry?.ids ?? [];
}

/**
 * Record question IDs as seen for a given lesson section.
 * Maintains a rolling window of MAX_IDS_PER_ENTRY most recent IDs.
 */
export function markQuestionsSeen(lessonId: number, sectionId: string, questionIds: string[]): void {
  const data = loadData();
  const key = buildKey(lessonId, sectionId);
  const existing = data[key]?.ids ?? [];

  // Append new IDs (avoid duplicates), keep only the most recent entries
  const combined = [...existing];
  for (const id of questionIds) {
    if (!combined.includes(id)) {
      combined.push(id);
    }
  }

  data[key] = {
    ids: combined.slice(-MAX_IDS_PER_ENTRY),
    updatedAt: Date.now(),
  };
  saveData(data);
}

/**
 * Clear seen questions — all entries, or for a specific lesson/section.
 */
export function clearSeenQuestions(lessonId?: number, sectionId?: string): void {
  if (typeof window === 'undefined') return;
  if (lessonId !== undefined && sectionId !== undefined) {
    const data = loadData();
    delete data[buildKey(lessonId, sectionId)];
    saveData(data);
  } else {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
