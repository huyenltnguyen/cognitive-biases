import type { GradeResult } from '../../utils/grade';
import styles from './FeedbackAlert.module.css';

interface FeedbackAlertProps {
  result: GradeResult;
  className?: string;
}

export function FeedbackAlert({ result, className }: FeedbackAlertProps) {
  if (!result.feedback?.length) return null;

  const variant = result.passed ? 'success' : 'danger';

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} aria-live="polite" aria-atomic="true">
      <div className={`${styles.alert} ${styles[variant]}`} role="alert">
        <ul className={styles.feedbackList}>
          {result.feedback.length > 1 && result.feedback[0] === 'All correct!' ? (
            <li className={styles.feedbackItem}>
              <div className={styles.firstLine}>{result.feedback[0]}</div>
              {result.feedback.slice(1).map((msg, i) => (
                <div key={i} className={styles.extraLine}>
                  {msg}
                </div>
              ))}
            </li>
          ) : (
            result.feedback.map((msg, idx) => (
              <li key={idx} className={styles.feedbackItem}>
                {msg}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
