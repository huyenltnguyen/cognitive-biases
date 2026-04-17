import type { LessonNode, BridgeLessonFrontmatter } from '../../types/content';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { Button } from '../shared/Button';
import styles from './BridgeLesson.module.css';

interface BridgeLessonProps {
  lesson: LessonNode;
  onContinue: () => void;
}

export function BridgeLesson({ lesson, onContinue }: BridgeLessonProps) {
  const fm = lesson.frontmatter as BridgeLessonFrontmatter;
  const { bridge } = fm;

  return (
    <article className={styles.article} aria-label={fm.title}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.lessonType}>Bridge</span>
          <span className={styles.duration}>~{fm.estimated_minutes} min</span>
        </div>
        <h1 className={styles.title}>{fm.title}</h1>
      </header>

      <div className={styles.bridgeFlow} aria-label="Module transition">
        <div className={styles.moduleLabel}>
          <span className={styles.fromLabel}>From</span>
          <strong>{bridge.from_module}</strong>
        </div>
        <span className={styles.arrow} aria-hidden="true">
          →
        </span>
        <div className={styles.moduleLabel}>
          <span className={styles.toLabel}>To</span>
          <strong>{bridge.to_module}</strong>
        </div>
      </div>

      {lesson.body_markdown.trim() && (
        <MarkdownRenderer markdown={lesson.body_markdown} className={styles.body} />
      )}

      {bridge.key_points.length > 0 && (
        <aside className={styles.callout}>
          <span className={styles.calloutLabel}>Key Points</span>
          <ul className={styles.contrastsList}>
            {bridge.key_points.map((point, idx) => (
              <li key={idx} className={styles.contrastsItem}>
                {point}
              </li>
            ))}
          </ul>
        </aside>
      )}

      <div className={styles.controls}>
        <Button
          onClick={onContinue}
          type="button"
          variant="secondary"
          className={styles.continueButton}
        >
          Continue
          <span aria-hidden="true" className={styles.continueArrow}>
            →
          </span>
        </Button>
      </div>
    </article>
  );
}
