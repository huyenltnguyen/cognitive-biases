import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import type { Course, LessonNode } from '../../types/content';
import type { CourseProgress } from '../../types/progress';
import { buildLessonPath } from '../../router/route-utils';
import styles from './CourseNav.module.css';

interface LessonStatusIconProps {
  lessonId: string;
  progress: CourseProgress;
  isLocked: boolean;
}

function LessonStatusIcon({ lessonId, progress, isLocked }: LessonStatusIconProps) {
  const status = progress.lesson_progress[lessonId]?.status;
  if (isLocked) {
    return (
      <span className={`${styles.statusIcon} ${styles.locked}`} aria-label="Locked">
        🔒
      </span>
    );
  }
  if (status === 'completed' || status === 'in-progress') {
    return (
      <span className={`${styles.statusIcon} ${styles.completed}`} aria-label="Completed">
        ✓
      </span>
    );
  }
  return (
    <span className={`${styles.statusIcon} ${styles.notStarted}`} aria-label="Not started">
      ○
    </span>
  );
}

function isLessonLocked(lesson: LessonNode, progress: CourseProgress): boolean {
  const prerequisites = lesson.frontmatter.prerequisites ?? [];
  return prerequisites.some(
    (prereqId) => progress.lesson_progress[prereqId]?.status !== 'completed'
  );
}

interface ModuleNavProps {
  partNum: number;
  moduleNum: number;
  title: string;
  lessons: LessonNode[];
  progress: CourseProgress;
  defaultOpen: boolean;
}

function ModuleNav({ partNum, moduleNum, title, lessons, progress, defaultOpen }: ModuleNavProps) {
  const location = useLocation();
  const hasActiveLesson = lessons.some((l) => {
    return buildLessonPath(l.id) === location.pathname;
  });

  const [isOpen, setIsOpen] = useState(defaultOpen || hasActiveLesson);

  useEffect(() => {
    if (hasActiveLesson) {
      setIsOpen(true);
    }
  }, [hasActiveLesson]);
  const moduleId = `module-nav-${partNum}-${moduleNum}`;

  const completedCount = lessons.filter(
    (l) => progress.lesson_progress[l.id]?.status === 'completed'
  ).length;

  return (
    <div className={styles.moduleGroup}>
      <button
        className={styles.moduleToggle}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={moduleId}
        type="button"
      >
        <span className={styles.moduleChevron} aria-hidden="true">
          {isOpen ? '▾' : '▸'}
        </span>
        <span className={styles.moduleTitle}>{title}</span>
        <span
          className={styles.moduleProgress}
          aria-label={`${completedCount} completed of ${lessons.length} lessons`}
        >
          {completedCount}/{lessons.length}
        </span>
      </button>

      <ul id={moduleId} className={styles.lessonList} hidden={!isOpen} role="list">
        {lessons.map((lesson) => {
          const locked = isLessonLocked(lesson, progress);
          const path = buildLessonPath(lesson.id);

          return (
            <li key={lesson.id} className={styles.lessonItem}>
              {locked ? (
                <span
                  className={`${styles.lessonLink} ${styles.lockedLesson}`}
                  aria-disabled="true"
                >
                  <LessonStatusIcon lessonId={lesson.id} progress={progress} isLocked={true} />
                  <span className={styles.lessonTitle}>{lesson.frontmatter.title}</span>
                </span>
              ) : (
                <NavLink
                  to={path}
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                  }}
                  className={({ isActive }) =>
                    `${styles.lessonLink} ${isActive ? styles.activeLesson : ''}`
                  }
                >
                  <LessonStatusIcon lessonId={lesson.id} progress={progress} isLocked={false} />
                  <span className={styles.lessonTitle}>{lesson.frontmatter.title}</span>
                </NavLink>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface CourseNavProps {
  course: Course;
  progress: CourseProgress;
}

export function CourseNav({ course, progress }: CourseNavProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const normalizedQuery = searchQuery.trim().toLowerCase();

  return (
    <div className={styles.nav}>
      <h2 className="sr-only">{course.title} lessons</h2>

      <div className={styles.searchWrap}>
        <label htmlFor="lesson-search" className="sr-only">
          Search lessons
        </label>
        <input
          id="lesson-search"
          type="search"
          className={styles.searchInput}
          placeholder="Search lessons"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
      </div>

      {course.parts.map((part) => (
        <div key={part.id} className={styles.partGroup}>
          <div className={styles.partLabel}>{part.title}</div>
          {part.modules.map((module, idx) => {
            const lessons = normalizedQuery
              ? module.lessons.filter((lesson) =>
                  lesson.frontmatter.title.toLowerCase().includes(normalizedQuery)
                )
              : module.lessons;

            if (normalizedQuery && lessons.length === 0) {
              return null;
            }

            return (
              <ModuleNav
                key={module.id}
                partNum={part.part}
                moduleNum={module.module}
                title={module.title}
                lessons={lessons}
                progress={progress}
                defaultOpen={Boolean(normalizedQuery) || idx === 0}
              />
            );
          })}
        </div>
      ))}

      {normalizedQuery &&
        !course.parts.some((part) =>
          part.modules.some((module) =>
            module.lessons.some((lesson) =>
              lesson.frontmatter.title.toLowerCase().includes(normalizedQuery)
            )
          )
        ) && (
          <p className={styles.noResults} role="status">
            No lessons match "{searchQuery}".
          </p>
        )}
    </div>
  );
}
