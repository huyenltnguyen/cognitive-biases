import type { LessonNode, ExerciseLessonFrontmatter } from '../../types/content';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { ExerciseWrapper } from '../exercises/ExerciseWrapper';
import styles from './ExerciseLesson.module.css';

interface ExerciseLessonProps {
  lesson: LessonNode;
  onComplete: (score: number) => void;
  canProceed: boolean;
  onContinue: () => void;
}

export function ExerciseLesson({ lesson, onComplete, canProceed, onContinue }: ExerciseLessonProps) {
  const fm = lesson.frontmatter as ExerciseLessonFrontmatter;

  return (
    <article className={styles.article} aria-label={fm.title}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.lessonType}>Exercise</span>
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
