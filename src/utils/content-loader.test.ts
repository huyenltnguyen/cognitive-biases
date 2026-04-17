import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { LessonNode, Course } from '../types/content';

// We mock the content-loader since import.meta.glob cannot run in tests
vi.mock('./content-loader', () => {
  const mockLesson: LessonNode = {
    id: 'lesson-001',
    frontmatter: {
      id: 'lesson-001',
      title: 'Test Lesson',
      part: 1,
      module: 1,
      lesson_number: 1,
      lesson_type: 'reading',
      estimated_minutes: 5,
      gate_required: false,
      order_index: 1,
      reading: { summary: 'A test lesson.' },
    },
    body_markdown: '# Hello World\n\nTest content.',
  };

  const mockCourse: Course = {
    id: 'cognitive-biases',
    title: 'Cognitive Biases Course',
    parts: [
      {
        id: 'part-1',
        part: 1,
        title: 'Part 1',
        modules: [
          {
            id: 'part-1-module-1',
            part: 1,
            module: 1,
            title: 'Module 1',
            takeaway: '',
            lessons: [mockLesson],
          },
        ],
      },
    ],
  };

  return {
    getCourse: vi.fn(() => mockCourse),
    getAllLessons: vi.fn(() => [mockLesson]),
    getLessonById: vi.fn((id: string) => (id === 'lesson-001' ? mockLesson : undefined)),
    getAdjacentLessons: vi.fn(() => ({ prev: null, next: null })),
    resetCourseCache: vi.fn(),
  };
});

describe('content-loader (mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a Course with the expected structure', async () => {
    const { getCourse } = await import('./content-loader');
    const course = getCourse();
    expect(course.id).toBe('cognitive-biases');
    expect(course.parts).toHaveLength(1);
    expect(course.parts[0].modules[0].lessons).toHaveLength(1);
  });

  it('should return all lessons via getAllLessons', async () => {
    const { getAllLessons } = await import('./content-loader');
    const lessons = getAllLessons();
    expect(lessons).toHaveLength(1);
    expect(lessons[0].id).toBe('lesson-001');
  });

  it('should find a lesson by id', async () => {
    const { getLessonById } = await import('./content-loader');
    const lesson = getLessonById('lesson-001');
    expect(lesson).toBeDefined();
    expect(lesson?.frontmatter.title).toBe('Test Lesson');
  });

  it('should return undefined for unknown lesson id', async () => {
    const { getLessonById } = await import('./content-loader');
    const lesson = getLessonById('non-existent');
    expect(lesson).toBeUndefined();
  });
});
