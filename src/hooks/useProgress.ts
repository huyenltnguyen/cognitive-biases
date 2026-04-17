import { useSyncExternalStore, useCallback } from 'react';
import type { CourseProgress, LessonProgress } from '../types/progress';
import { getProgressSnapshot, saveProgress, resetProgress, subscribeToProgress } from '../utils/storage';

export interface UseProgressReturn {
  progress: CourseProgress;
  completeLesson: (lessonId: string, score?: number) => void;
  markInProgress: (lessonId: string, gateRequired?: boolean) => void;
  resetCourse: () => void;
}

export function useProgress(): UseProgressReturn {
  const progress = useSyncExternalStore(subscribeToProgress, getProgressSnapshot);

  const completeLesson = useCallback((lessonId: string, score?: number) => {
    const current = getProgressSnapshot();
    const existing = current.lesson_progress[lessonId];
    const updated: LessonProgress = {
      lesson_id: lessonId,
      status: 'completed',
      attempts: (existing?.attempts ?? 0) + 1,
      last_score: score,
      completed_at: new Date().toISOString(),
    };
    const completedGates = current.completed_gate_lessons.includes(lessonId)
      ? current.completed_gate_lessons
      : [...current.completed_gate_lessons, lessonId];

    saveProgress({
      ...current,
      last_active_at: new Date().toISOString(),
      lesson_progress: {
        ...current.lesson_progress,
        [lessonId]: updated,
      },
      completed_gate_lessons: completedGates,
    });
  }, []);

  const markInProgress = useCallback((lessonId: string, gateRequired = false) => {
    const current = getProgressSnapshot();
    if (current.lesson_progress[lessonId]?.status === 'completed') return;

    if (gateRequired) {
      saveProgress({
        ...current,
        last_active_at: new Date().toISOString(),
      });
      return;
    }

    const existing = current.lesson_progress[lessonId];
    const updated: LessonProgress = {
      lesson_id: lessonId,
      status: 'completed',
      attempts: existing?.attempts ?? 0,
      completed_at: existing?.completed_at ?? new Date().toISOString(),
    };
    saveProgress({
      ...current,
      last_active_at: new Date().toISOString(),
      lesson_progress: {
        ...current.lesson_progress,
        [lessonId]: updated,
      },
    });
  }, []);

  const resetCourse = useCallback(() => {
    resetProgress();
  }, []);

  return { progress, completeLesson, markInProgress, resetCourse };
}