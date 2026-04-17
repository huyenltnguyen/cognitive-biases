import type { LessonNode } from '../../types/content';
import { ReadingLesson } from './ReadingLesson';
import { ExerciseLesson } from './ExerciseLesson';
import { ExerciseUngradedLesson } from './ExerciseUngradedLesson';
import { LongExerciseLesson } from './LongExerciseLesson';
import { BridgeLesson } from './BridgeLesson';

interface LessonDispatcherProps {
  lesson: LessonNode;
  onComplete: (score?: number) => void;
  canProceed: boolean;
  onContinue: () => void;
}

export function LessonDispatcher({ lesson, onComplete, canProceed, onContinue }: LessonDispatcherProps) {
  const { lesson_type } = lesson.frontmatter;

  switch (lesson_type) {
    case 'reading':
      return <ReadingLesson lesson={lesson} onContinue={onContinue} />;

    case 'exercise':
      return (
        <ExerciseLesson
          lesson={lesson}
          onComplete={(score) => onComplete(score)}
          canProceed={canProceed}
          onContinue={onContinue}
        />
      );

    case 'exercise-ungraded':
      return (
        <ExerciseUngradedLesson
          lesson={lesson}
          onComplete={() => onComplete(undefined)}
          onContinue={onContinue}
        />
      );

    case 'long-exercise':
      return (
        <LongExerciseLesson
          lesson={lesson}
          onComplete={(score) => onComplete(score)}
          canProceed={canProceed}
          onContinue={onContinue}
        />
      );

    case 'bridge':
      return <BridgeLesson lesson={lesson} onContinue={onContinue} />;

    default: {
      const exhaustive: never = lesson_type;
      console.error(`Unknown lesson type: ${String(exhaustive)}`);
      return null;
    }
  }
}
