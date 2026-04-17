import { useMemo } from 'react';
import { useProgress } from './useProgress';
import { getCourse } from '../utils/content-loader';

export interface LessonGateState {
  isLocked: boolean;
  canProceed: boolean;
}

export function useLessonGate(lessonId: string): LessonGateState {
  const { progress } = useProgress();

  return useMemo((): LessonGateState => {
    const course = getCourse();

    let targetLesson = null;
    for (const part of course.parts) {
      for (const module of part.modules) {
        for (const lesson of module.lessons) {
          if (lesson.id === lessonId) {
            targetLesson = lesson;
            break;
          }
        }
        if (targetLesson) break;
      }
      if (targetLesson) break;
    }

    if (!targetLesson) {
      return { isLocked: false, canProceed: false };
    }

    const lessonProgress = progress.lesson_progress[lessonId];
    const isCompleted = lessonProgress?.status === 'completed';

    if (!targetLesson.frontmatter.gate_required) {
      return { isLocked: false, canProceed: true };
    }

    const prerequisites = targetLesson.frontmatter.prerequisites ?? [];
    const allPrereqsMet = prerequisites.every(
      (prereqId) => progress.lesson_progress[prereqId]?.status === 'completed'
    );

    return {
      isLocked: !allPrereqsMet,
      canProceed: isCompleted,
    };
  }, [lessonId, progress]);
}