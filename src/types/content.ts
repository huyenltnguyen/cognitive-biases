export type LessonType = 'reading' | 'exercise' | 'exercise-ungraded' | 'long-exercise' | 'bridge';

export type ExerciseKind = 'multiple-choice' | 'drag-drop' | 'matching' | 'slider';

export interface LessonFrontmatterBase {
  id: string;
  title: string;
  part: number;
  module: number;
  lesson_number: number;
  lesson_type: LessonType;
  estimated_minutes: number;
  takeaway?: string;
  tags?: string[];
  prerequisites?: string[];
  next_lesson_id?: string;
  gate_required: boolean;
  order_index: number;
}

// Reading
export interface ReadingLessonFrontmatter extends LessonFrontmatterBase {
  lesson_type: 'reading';
  reading: { summary: string };
  illustration?: {
    variant: 'reveal-table' | 'static-table' | 'narrative-visual';
    reveal_label?: string;
    reveal_required: boolean;
    aria_description: string;
    table?: {
      caption: string;
      columns: string[];
      rows: Array<{ id: string; cells: string[] }>;
      hidden_column_indexes?: number[];
    };
  };
}

// Bridge
export interface BridgeLessonFrontmatter extends LessonFrontmatterBase {
  lesson_type: 'bridge';
  bridge: {
    from_module: string;
    to_module: string;
    key_points: string[];
  };
}

// Exercise types
export interface ChoiceOption {
  id: string;
  label: string;
  explanation?: string;
}

export interface MultipleChoiceExerciseData {
  kind: 'multiple-choice';
  mode: 'single' | 'multi';
  question: string;
  options: ChoiceOption[];
  correct_option_ids?: string[];
  shuffle_options?: boolean;
  success_feedback?: string;
}

export interface DragDropItem {
  id: string;
  label: string;
}

export interface DragDropTarget {
  id: string;
  label: string;
  accepts_item_ids: string[];
}

export interface DragDropExerciseData {
  kind: 'drag-drop';
  instructions?: string;
  items: DragDropItem[];
  targets: DragDropTarget[];
  success_feedback?: string;
}

export interface MatchingPair {
  left_id: string;
  right_id: string;
}

export interface MatchingExerciseData {
  kind: 'matching';
  instructions?: string;
  left_items: Array<{ id: string; label: string }>;
  right_items: Array<{ id: string; label: string }>;
  correct_pairs?: MatchingPair[];
}

export interface SliderExerciseData {
  kind: 'slider';
  question: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
  correct_min?: number;
  correct_max?: number;
  reveal_value?: number;
}

export type GradedExerciseData =
  | MultipleChoiceExerciseData
  | DragDropExerciseData
  | MatchingExerciseData
  | SliderExerciseData;

export type UngradedExerciseData =
  | Omit<MultipleChoiceExerciseData, 'correct_option_ids'>
  | Omit<MatchingExerciseData, 'correct_pairs'>
  | Omit<SliderExerciseData, 'correct_min' | 'correct_max'>
  | DragDropExerciseData;

export interface ExerciseLessonFrontmatter extends LessonFrontmatterBase {
  lesson_type: 'exercise';
  gate_required: true;
  prompt?: string;
  attempts_allowed: number;
  exercise: GradedExerciseData | GradedExerciseData[];
  reflection_prompt?: string;
}

export interface ExerciseUngradedLessonFrontmatter extends LessonFrontmatterBase {
  lesson_type: 'exercise-ungraded';
  gate_required: false;
  prompt?: string;
  attempts_allowed: number;
  exercise: UngradedExerciseData | UngradedExerciseData[];
  reflection_prompt?: string;
}

export interface LongExerciseLessonFrontmatter extends LessonFrontmatterBase {
  lesson_type: 'long-exercise';
  gate_required: true;
  prompt?: string;
  attempts_allowed: number;
  reflection_prompt?: string;
  long_exercise: {
    expected_duration_minutes: number;
    scoring_mode: 'all-or-nothing' | 'partial';
  };
  exercise: GradedExerciseData;
}

export type LessonFrontmatter =
  | ReadingLessonFrontmatter
  | ExerciseLessonFrontmatter
  | ExerciseUngradedLessonFrontmatter
  | LongExerciseLessonFrontmatter
  | BridgeLessonFrontmatter;

export interface LessonNode {
  id: string;
  frontmatter: LessonFrontmatter;
  body_markdown: string;
}

export interface Module {
  id: string;
  part: number;
  module: number;
  title: string;
  takeaway: string;
  lessons: LessonNode[];
}

export interface Part {
  id: string;
  part: number;
  title: string;
  modules: Module[];
}

export interface Course {
  id: 'cognitive-biases';
  title: string;
  parts: Part[];
}
