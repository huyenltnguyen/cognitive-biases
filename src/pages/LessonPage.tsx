import { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useProgress } from '../hooks/useProgress';
import { useLessonGate } from '../hooks/useLessonGate';
import { AppShell } from '../components/layout/AppShell';
import { AppHeader } from '../components/layout/AppHeader';
import { CourseNav } from '../components/layout/CourseNav';
import { ProgressBar } from '../components/layout/ProgressBar';
import { LessonDispatcher } from '../components/lesson-types/LessonDispatcher';
import { buildLessonPath } from '../router/route-utils';
import { getCourse, getAdjacentLessons, getLessonById } from '../utils/content-loader';
import styles from './LessonPage.module.css';

export default function LessonPage() {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  const lessonNode = lessonId ? getLessonById(lessonId) : undefined;
  const { progress, completeLesson, markInProgress } = useProgress();
  const { canProceed } = useLessonGate(lessonNode?.id ?? '');

  const course = getCourse();

  const totalLessons = course.parts.flatMap((p) => p.modules.flatMap((m) => m.lessons)).length;
  const completedLessons = Object.values(progress.lesson_progress).filter(
    (lp) => lp.status === 'completed'
  ).length;

  useEffect(() => {
    if (lessonNode) {
      markInProgress(lessonNode.id, lessonNode.frontmatter.gate_required);
    }
  }, [lessonNode?.id, lessonNode?.frontmatter.gate_required, markInProgress]);

  if (!lessonNode) {
    return <Navigate to="/" replace />;
  }

  const { next } = getAdjacentLessons(lessonNode.id);

  function handleComplete(score?: number) {
    if (lessonNode) {
      completeLesson(lessonNode.id, score);
    }
  }

  function handleContinue() {
    if (!next) {
      navigate('/course/complete');
      return;
    }

    navigate(buildLessonPath(next.id));
  }

  return (
    <AppShell
      sidebar={
        <div className={styles.sidebarStack}>
          <CourseNav course={course} progress={progress} />
        </div>
      }
      sidebarAriaLabel={`${course.title} navigation`}
      header={
        <AppHeader>
          <ProgressBar completed={completedLessons} total={totalLessons} />
        </AppHeader>
      }
    >
      <div className={styles.pageWrapper}>
        <div className={styles.lessonContent}>
          <LessonDispatcher
            lesson={lessonNode}
            onComplete={handleComplete}
            canProceed={canProceed}
            onContinue={handleContinue}
          />
        </div>
      </div>
    </AppShell>
  );
}
