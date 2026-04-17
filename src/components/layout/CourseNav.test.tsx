import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CourseNav } from './CourseNav';
import type { Course } from '../../types/content';
import type { CourseProgress } from '../../types/progress';

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
          lessons: [
            {
              id: 'lesson-001',
              frontmatter: {
                id: 'lesson-001',
                title: 'First Lesson',
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
                title: 'Locked Lesson',
                part: 1,
                module: 1,
                lesson_number: 2,
                lesson_type: 'reading',
                estimated_minutes: 5,
                gate_required: true,
                order_index: 2,
                prerequisites: ['lesson-001'],
                reading: { summary: '' },
              },
              body_markdown: '',
            },
          ],
        },
      ],
    },
  ],
};

const emptyProgress: CourseProgress = {
  course_id: 'cognitive-biases',
  started_at: '',
  last_active_at: '',
  lesson_progress: {},
  module_progress: {},
  completed_gate_lessons: [],
  capstone_completed: false,
  version: 1,
};

const completedProgress: CourseProgress = {
  ...emptyProgress,
  lesson_progress: {
    'lesson-001': {
      lesson_id: 'lesson-001',
      status: 'completed',
      attempts: 1,
      completed_at: new Date().toISOString(),
    },
  },
};

function renderNav(progress: CourseProgress = emptyProgress) {
  return render(
    <MemoryRouter>
      <CourseNav course={mockCourse} progress={progress} />
    </MemoryRouter>
  );
}

describe('CourseNav', () => {
  it('should render an accessible course lessons heading', () => {
    renderNav();
    expect(screen.getByRole('heading', { name: 'Cognitive Biases Course lessons' })).toBeInTheDocument();
  });

  it('should render module toggles', () => {
    renderNav();
    expect(screen.getByText('Module 1')).toBeInTheDocument();
  });

  it('should show lesson titles when module is expanded', () => {
    renderNav();
    expect(screen.getByText('First Lesson')).toBeInTheDocument();
  });

  it('should collapse the module list when toggle is clicked', async () => {
    const user = userEvent.setup();
    renderNav();
    const toggle = screen.getByRole('button', { name: /module 1/i });
    await user.click(toggle);
    // The lesson list should be hidden (hidden attribute removes it from the accessibility tree)
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should show a locked indicator for lessons with unmet prerequisites', () => {
    renderNav(emptyProgress);
    // lesson-002 has prerequisite lesson-001 which is not completed
    expect(screen.getByLabelText('Locked')).toBeInTheDocument();
  });

  it('should show a completed indicator when a lesson is done', () => {
    renderNav(completedProgress);
    expect(screen.getByLabelText('Completed')).toBeInTheDocument();
  });

  it('should render lesson-001 as a NavLink when not locked', () => {
    renderNav();
    expect(
      screen.getByRole('link', { name: /first lesson/i })
    ).toBeInTheDocument();
  });

  it('should show progress count for module', () => {
    renderNav(emptyProgress);
    expect(screen.getByLabelText(/0 completed of 2 lessons/i)).toBeInTheDocument();
  });

  it('should update progress count when a lesson is completed', () => {
    renderNav(completedProgress);
    expect(screen.getByLabelText(/1 completed of 2 lessons/i)).toBeInTheDocument();
  });
});