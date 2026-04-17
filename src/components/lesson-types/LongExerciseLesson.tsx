import type { LessonNode, LongExerciseLessonFrontmatter } from '../../types/content';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { ExerciseWrapper } from '../exercises/ExerciseWrapper';
import styles from './LongExerciseLesson.module.css';

interface LongExerciseLessonProps {
  lesson: LessonNode;
  onComplete: (score: number) => void;
  canProceed: boolean;
  onContinue: () => void;
}

export function LongExerciseLesson({ lesson, onComplete, canProceed, onContinue }: LongExerciseLessonProps) {
  const fm = lesson.frontmatter as LongExerciseLessonFrontmatter;

  return (
    <article className={styles.article} aria-label={fm.title}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.lessonType}>Long Exercise</span>
          <span className={styles.duration}>~{fm.long_exercise.expected_duration_minutes} min</span>
        </div>
        <h1 className={styles.title}>{fm.title}</h1>
      </header>

      <div className={styles.info} role="note">
        <p>
          This exercise takes approximately{' '}
          <strong>{fm.long_exercise.expected_duration_minutes} minutes</strong> to complete. Take
          your time.
        </p>
      </div>

      {lesson.body_markdown.trim() && (
        <MarkdownRenderer markdown={lesson.body_markdown} className={styles.body} />
      )}

      <div className={styles.exerciseSection}>
        {fm.prompt && <p className={styles.prompt}>{fm.prompt}</p>}
        <ExerciseWrapper
          exercise={fm.exercise}
          isGraded={true}
          attemptsAllowed={fm.attempts_allowed}
          lessonId={lesson.id}
          onComplete={onComplete}
          alreadyCompleted={canProceed}
          reflectionPrompt={fm.reflection_prompt}
          onContinue={onContinue}
        />
      </div>
    </article>
  );
}
