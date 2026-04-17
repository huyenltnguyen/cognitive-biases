import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

// We need to mock both content-loader and useProgress
vi.mock('../utils/content-loader', () => ({
  getCourse: vi.fn(() => ({
    id: 'cognitive-biases',
    title: 'Test',
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
            lessons: [
              {
                id: 'lesson-001',
                frontmatter: {
                  id: 'lesson-001',
                  title: 'Free Lesson',
                  part: 1,
                  module: 1,
                  lesson_number: 1,
                  lesson_type: 'reading',
                  estimated_minutes: 5,
                  gate_required: false,
                  order_index: 1,
                  reading: { summary: '' },
                },
                body_markdown: '',
              },
              {
                id: 'lesson-002',
                frontmatter: {
                  id: 'lesson-002',
                  title: 'Gated Lesson',
                  part: 1,
                  module: 1,
                  lesson_number: 2,
                  lesson_type: 'exercise',
                  estimated_minutes: 10,
                  gate_required: true,
                  order_index: 2,
                  prerequisites: ['lesson-001'],
                  prompt: 'Test',
                  attempts_allowed: 3,
                  exercise: {
                    kind: 'multiple-choice',
                    mode: 'single',
                    question: 'Q?',
                    options: [],
                  },
                },
                body_markdown: '',
              },
            ],
          },
        ],
      },
    ],
  })),
}));

const mockProgress = {
  course_id: 'cognitive-biases' as const,
  started_at: '',
  last_active_at: '',
  lesson_progress: {} as Record<string, import('../types/progress').LessonProgress>,
  module_progress: {},
  completed_gate_lessons: [],
  capstone_completed: false,
  version: 1 as const,
};

vi.mock('./useProgress', () => ({
  useProgress: vi.fn(() => ({
    progress: mockProgress,
    completeLesson: vi.fn(),
    markInProgress: vi.fn(),
    resetCourse: vi.fn(),
  })),
}));

describe('useLessonGate', () => {
  beforeEach(() => {
    mockProgress.lesson_progress = {};
    vi.clearAllMocks();
  });

  it('should not lock a lesson that has no prerequisites', async () => {
    const { useLessonGate } = await import('./useLessonGate');
    const { result } = renderHook(() => useLessonGate('lesson-001'));
    expect(result.current.isLocked).toBe(false);
  });

  it('should lock a lesson when prerequisite is not completed', async () => {
    const { useLessonGate } = await import('./useLessonGate');
    const { result } = renderHook(() => useLessonGate('lesson-002'));
    expect(result.current.isLocked).toBe(true);
  });

  it('should unlock when prerequisite is completed', async () => {
    mockProgress.lesson_progress = {
      'lesson-001': {
        lesson_id: 'lesson-001',
        status: 'completed',
        attempts: 1,
        completed_at: new Date().toISOString(),
      },
    };
    const { useLessonGate } = await import('./useLessonGate');
    const { result } = renderHook(() => useLessonGate('lesson-002'));
    expect(result.current.isLocked).toBe(false);
  });

  it('should return canProceed: true for gate_required: false lessons', async () => {
    const { useLessonGate } = await import('./useLessonGate');
    const { result } = renderHook(() => useLessonGate('lesson-001'));
    expect(result.current.canProceed).toBe(true);
  });

  it('should return canProceed: false for gated lesson not yet completed', async () => {
    mockProgress.lesson_progress = {
      'lesson-001': {
        lesson_id: 'lesson-001',
        status: 'completed',
        attempts: 1,
      },
    };
    const { useLessonGate } = await import('./useLessonGate');
    const { result } = renderHook(() => useLessonGate('lesson-002'));
    expect(result.current.canProceed).toBe(false);
  });
});
