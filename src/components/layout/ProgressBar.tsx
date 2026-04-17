import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  completed: number;
  total: number;
}

export function ProgressBar({ completed, total }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Course progress: ${completed} of ${total} lessons completed`}
      >
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
