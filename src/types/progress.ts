export type LessonStatus = 'not-started' | 'in-progress' | 'completed';

export interface LessonProgress {
  lesson_id: string;
  status: LessonStatus;
  attempts: number;
  last_score?: number;
  completed_at?: string;
}

export interface ModuleProgress {
  module_id: string;
  completed_lessons: number;
  total_lessons: number;
}

export interface CourseProgress {
  course_id: 'cognitive-biases';
  started_at: string;
  last_active_at: string;
  lesson_progress: Record<string, LessonProgress>;
  module_progress: Record<string, ModuleProgress>;
  completed_gate_lessons: string[];
  capstone_completed: boolean;
  version: 1;
}