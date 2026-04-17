import type { LessonNode, ExerciseUngradedLessonFrontmatter } from '../../types/content';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { ExerciseWrapper } from '../exercises/ExerciseWrapper';
import styles from './ExerciseUngradedLesson.module.css';

interface ExerciseUngradedLessonProps {
  lesson: LessonNode;
  onComplete: () => void;
  onContinue: () => void;
}

export function ExerciseUngradedLesson({ lesson, onComplete, onContinue }: ExerciseUngradedLessonProps) {
  const fm = lesson.frontmatter as ExerciseUngradedLessonFrontmatter;

  return (
    <article className={styles.article} aria-label={fm.title}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.lessonType}>Reflection</span>
          <span className={styles.duration}>~{fm.estimated_minutes} min</span>
        </div>
        <h1 className={styles.title}>{fm.title}</h1>
      </header>

      {lesson.body_markdown.trim() && (
        <MarkdownRenderer markdown={lesson.body_markdown} className={styles.body} />
      )}

      <div className={styles.exerciseSection}>
        {fm.prompt && <p className={styles.prompt}>{fm.prompt}</p>}
        <ExerciseWrapper
          exercise={fm.exercise as import('../../types/content').GradedExerciseData}
          isGraded={false}
          attemptsAllowed={fm.attempts_allowed}
          lessonId={lesson.id}
          onComplete={() => onComplete()}
          alreadyCompleted={false}
          reflectionPrompt={fm.reflection_prompt}
          onContinue={onContinue}
        />
      </div>
    </article>
  );
}
