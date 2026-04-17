import { useNavigate } from 'react-router-dom';
import { Button } from '../components/shared/Button';
import { useProgress } from '../hooks/useProgress';
import { getCourse } from '../utils/content-loader';
import styles from './CompletePage.module.css';

export default function CompletePage() {
  const navigate = useNavigate();
  const { progress } = useProgress();

  const course = getCourse();
  const totalLessons = course.parts.flatMap((p) => p.modules.flatMap((m) => m.lessons)).length;
  const completedLessons = Object.values(progress.lesson_progress).filter(
    (lp) => lp.status === 'completed'
  ).length;

  return (
    <main className={styles.page} aria-label="Course complete">
      <div className={styles.container}>
        <div className={styles.badge} aria-hidden="true">🎓</div>

        <h1 className={styles.title}>Course Complete!</h1>
        <p className={styles.subtitle}>
          You've finished the Cognitive Biases Course.
        </p>

        <div className={styles.stats} aria-label="Your results">
          <div className={styles.stat}>
            <span className={styles.statValue}>{completedLessons}</span>
            <span className={styles.statLabel}>Lessons Completed</span>
          </div>

          <div className={styles.statDivider} aria-hidden="true" />

          <div className={styles.stat}>
            <span className={styles.statValue}>{totalLessons}</span>
            <span className={styles.statLabel}>Total Lessons</span>
          </div>
        </div>

        {progress.started_at && (
          <p className={styles.startedAt}>
            Started{' '}
            {new Intl.DateTimeFormat('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }).format(new Date(progress.started_at))}
          </p>
        )}

        <div className={styles.actions}>
          <Button onClick={() => navigate('/')} type="button" variant="secondary">
            Review Course
          </Button>
        </div>
      </div>
    </main>
  );
}