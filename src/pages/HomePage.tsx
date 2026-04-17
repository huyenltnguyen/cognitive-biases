import { Link } from 'react-router-dom';
import { getCourse } from '../utils/content-loader';
import { useProgress } from '../hooks/useProgress';
import { buildLessonPath } from '../router/route-utils';
import styles from './HomePage.module.css';

const STATUS_LABEL: Record<string, string> = {
  completed: '✓',
  'in-progress': '✓',
  'not-started': '',
};

export default function HomePage() {
  const course = getCourse();
  const { progress } = useProgress();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{course.title}</h1>
        <p className={styles.subtitle}>
          {course.parts.flatMap((p) => p.modules.flatMap((m) => m.lessons)).length} lessons
        </p>
      </header>

      <ol className={styles.partList}>
        {course.parts.map((part) => (
          <li key={part.id} className={styles.partItem}>
            <h2 className={styles.partTitle}>{part.title}</h2>
            <ol className={styles.moduleList}>
              {part.modules.map((mod) => (
                <li key={mod.id} className={styles.moduleItem}>
                  <h3 className={styles.moduleTitle}>{mod.title}</h3>
                  <ol className={styles.lessonList}>
                    {mod.lessons.map((lesson) => {
                      const lp = progress.lesson_progress[lesson.id];
                      const status = lp?.status ?? 'not-started';
                      return (
                        <li key={lesson.id} className={`${styles.lessonItem} ${styles[status]}`}>
                          <Link
                            to={buildLessonPath(lesson.id)}
                            className={styles.lessonLink}
                            aria-label={`${lesson.frontmatter.title}${status === 'completed' || status === 'in-progress' ? ' (completed)' : ''}`}
                          >
                            <span className={styles.lessonMeta}>
                              {lesson.frontmatter.lesson_type}
                            </span>
                            <span className={styles.lessonTitle}>{lesson.frontmatter.title}</span>
                            {STATUS_LABEL[status] && (
                              <span className={styles.statusIcon} aria-hidden="true">
                                {STATUS_LABEL[status]}
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </main>
  );
}
