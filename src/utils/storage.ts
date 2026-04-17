import type { CourseProgress } from '../types/progress';

const STORAGE_KEY = 'cognitive-biases.progress.v1';

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToProgress(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notifyListeners(): void {
  listeners.forEach((l) => l());
}

export function loadProgress(): CourseProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      (parsed as { version?: unknown }).version !== 1
    ) {
      return null;
    }
    return parsed as CourseProgress;
  } catch {
    return null;
  }
}

// Stable snapshot cache — required by useSyncExternalStore.
// getProgressSnapshot() must return the same reference between renders
// unless saveProgress/resetProgress is called.
let _snapshot: CourseProgress | null = null;

export function getProgressSnapshot(): CourseProgress {
  if (_snapshot === null) {
    _snapshot = loadProgress() ?? {
      course_id: 'cognitive-biases',
      started_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      lesson_progress: {},
      module_progress: {},
      completed_gate_lessons: [],
      capstone_completed: false,
      version: 1,
    };
  }
  return _snapshot;
}

export function saveProgress(progress: CourseProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  _snapshot = progress;
  notifyListeners();
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
  _snapshot = null;
  notifyListeners();
}