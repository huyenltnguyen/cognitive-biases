import type {
  LessonFrontmatter,
  LessonType,
  ReadingLessonFrontmatter,
  GradedExerciseData,
  UngradedExerciseData,
} from '../types/content';

type RawFrontmatter = Record<string, unknown>;

function requireString(obj: RawFrontmatter, key: string, path: string): string {
  const val = obj[key];
  if (typeof val !== 'string' || val.trim() === '') {
    throw new Error(`[${path}] frontmatter.${key} must be a non-empty string`);
  }
  return val;
}

function requireNumber(obj: RawFrontmatter, key: string, path: string): number {
  const val = obj[key];
  if (typeof val !== 'number') {
    throw new Error(`[${path}] frontmatter.${key} must be a number`);
  }
  return val;
}

function requireBoolean(obj: RawFrontmatter, key: string, path: string): boolean {
  const val = obj[key];
  if (typeof val !== 'boolean') {
    throw new Error(`[${path}] frontmatter.${key} must be a boolean`);
  }
  return val;
}

function optionalString(obj: RawFrontmatter, key: string): string | undefined {
  const val = obj[key];
  return typeof val === 'string' ? val : undefined;
}

function optionalStringArray(obj: RawFrontmatter, key: string): string[] | undefined {
  const val = obj[key];
  if (!Array.isArray(val)) return undefined;
  return val.filter((v): v is string => typeof v === 'string');
}

const LESSON_TYPES: LessonType[] = [
  'reading',
  'exercise',
  'exercise-ungraded',
  'long-exercise',
  'bridge',
];

function validateExerciseData(
  data: unknown,
  path: string
): GradedExerciseData | GradedExerciseData[] {
  // Allow either a single exercise object or an array of exercises (multi-step)
  if (Array.isArray(data)) {
    return data.map((d, i) => validateExerciseData(d, `${path}[${i}]`)) as GradedExerciseData[];
  }

  if (typeof data !== 'object' || data === null) {
    throw new Error(`[${path}] frontmatter.exercise must be an object or an array of objects`);
  }
  const ex = data as RawFrontmatter;
  const kind = ex['kind'];
  if (kind === 'multiple-choice') {
    return {
      kind: 'multiple-choice',
      mode: (ex['mode'] as 'single' | 'multi') ?? 'single',
      question: requireString(ex, 'question', path),
      options: (ex['options'] as GradedExerciseData extends { options: infer O } ? O : never) ?? [],
      correct_option_ids: optionalStringArray(ex, 'correct_option_ids'),
      success_feedback: optionalString(ex, 'success_feedback'),
      shuffle_options:
        typeof ex['shuffle_options'] === 'boolean' ? ex['shuffle_options'] : undefined,
    };
  }
  if (kind === 'drag-drop') {
    return {
      kind: 'drag-drop',
      instructions: optionalString(ex, 'instructions'),
      items: (ex['items'] as Array<{ id: string; label: string }>) ?? [],
      targets:
        (ex['targets'] as Array<{ id: string; label: string; accepts_item_ids: string[] }>) ?? [],
    };
  }
  if (kind === 'matching') {
    return {
      kind: 'matching',
      instructions: optionalString(ex, 'instructions'),
      left_items: (ex['left_items'] as Array<{ id: string; label: string }>) ?? [],
      right_items: (ex['right_items'] as Array<{ id: string; label: string }>) ?? [],
      correct_pairs: ex['correct_pairs'] as
        | Array<{ left_id: string; right_id: string }>
        | undefined,
    };
  }
  if (kind === 'slider') {
    return {
      kind: 'slider',
      question: requireString(ex, 'question', path),
      min: requireNumber(ex, 'min', path),
      max: requireNumber(ex, 'max', path),
      step: requireNumber(ex, 'step', path),
      unit: optionalString(ex, 'unit'),
      correct_min:
        typeof ex['correct_min'] === 'number' ? (ex['correct_min'] as number) : undefined,
      correct_max:
        typeof ex['correct_max'] === 'number' ? (ex['correct_max'] as number) : undefined,
      reveal_value:
        typeof ex['reveal_value'] === 'number' ? (ex['reveal_value'] as number) : undefined,
    };
  }
  throw new Error(`[${path}] exercise.kind "${String(kind)}" is not recognized`);
}

function validateUngradedExerciseData(data: unknown, path: string): UngradedExerciseData {
  // Ungraded exercises have the same structure minus grading fields
  return validateExerciseData(data, path) as unknown as UngradedExerciseData;
}

function validateIllustrationData(
  data: unknown,
  path: string
): ReadingLessonFrontmatter['illustration'] | undefined {
  if (typeof data !== 'object' || data === null) {
    return undefined;
  }

  const illus = data as RawFrontmatter;

  return {
    variant:
      (illus['variant'] as 'reveal-table' | 'static-table' | 'narrative-visual') ?? 'static-table',
    reveal_label: optionalString(illus, 'reveal_label'),
    reveal_required:
      typeof illus['reveal_required'] === 'boolean' ? (illus['reveal_required'] as boolean) : false,
    aria_description: requireString(illus, 'aria_description', path),
    table: illus['table'] as IllustrationTable | undefined,
  };
}

export function validateFrontmatter(raw: unknown, path: string): LessonFrontmatter {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`[${path}] frontmatter must be an object`);
  }
  const data = raw as RawFrontmatter;

  const lesson_type = data['lesson_type'] as string;
  if (!LESSON_TYPES.includes(lesson_type as LessonType)) {
    // Debugging aid: include the actual value and its type to help diagnose parsing issues.
    // This will be removed once the root cause is found.
    // eslint-disable-next-line no-console
    console.error(
      `[frontmatter-debug] ${path} lesson_type value:`,
      lesson_type,
      'typeof:',
      typeof lesson_type
    );
    throw new Error(`[${path}] frontmatter.lesson_type must be one of: ${LESSON_TYPES.join(', ')}`);
  }

  const base = {
    id: requireString(data, 'id', path),
    title: requireString(data, 'title', path),
    part: requireNumber(data, 'part', path),
    module: requireNumber(data, 'module', path),
    lesson_number: requireNumber(data, 'lesson_number', path),
    lesson_type: lesson_type as LessonType,
    estimated_minutes: requireNumber(data, 'estimated_minutes', path),
    gate_required: requireBoolean(data, 'gate_required', path),
    order_index: requireNumber(data, 'order_index', path),
    takeaway: optionalString(data, 'takeaway'),
    tags: optionalStringArray(data, 'tags'),
    prerequisites: optionalStringArray(data, 'prerequisites'),
    next_lesson_id: optionalString(data, 'next_lesson_id'),
  };

  switch (base.lesson_type) {
    case 'reading': {
      const reading = data['reading'] as RawFrontmatter | undefined;
      const illustrationData = data['illustration'];

      return {
        ...base,
        lesson_type: 'reading',
        reading: {
          summary: reading ? requireString(reading, 'summary', path) : '',
        },
        illustration: validateIllustrationData(illustrationData, path),
      };
    }

    case 'bridge': {
      const bridge = data['bridge'] as RawFrontmatter;
      if (!bridge) throw new Error(`[${path}] frontmatter.bridge is required`);
      return {
        ...base,
        lesson_type: 'bridge',
        bridge: {
          from_module: requireString(bridge, 'from_module', path),
          to_module: requireString(bridge, 'to_module', path),
          key_points: (bridge['key_points'] as string[]) ?? [],
        },
      };
    }

    case 'exercise': {
      const exerciseData = validateExerciseData(data['exercise'], path);
      const prompt = optionalString(data, 'prompt');
      const exercise = Array.isArray(exerciseData) ? exerciseData[0] : exerciseData;
      if (
        !prompt &&
        (exercise.kind === 'drag-drop' || exercise.kind === 'matching') &&
        !exercise.instructions
      ) {
        throw new Error(
          `[${path}] at least one of frontmatter.prompt or exercise.instructions must be provided`
        );
      }
      return {
        ...base,
        lesson_type: 'exercise',
        gate_required: true,
        prompt,
        attempts_allowed: requireNumber(data, 'attempts_allowed', path),
        exercise: exerciseData,
        reflection_prompt: optionalString(data, 'reflection_prompt'),
      };
    }

    case 'exercise-ungraded': {
      const exerciseData = validateUngradedExerciseData(data['exercise'], path);
      const prompt = optionalString(data, 'prompt');
      if (
        !prompt &&
        (exerciseData.kind === 'drag-drop' || exerciseData.kind === 'matching') &&
        !exerciseData.instructions
      ) {
        throw new Error(
          `[${path}] at least one of frontmatter.prompt or exercise.instructions must be provided`
        );
      }
      return {
        ...base,
        lesson_type: 'exercise-ungraded',
        gate_required: false,
        prompt,
        attempts_allowed: requireNumber(data, 'attempts_allowed', path),
        exercise: exerciseData,
        reflection_prompt: optionalString(data, 'reflection_prompt'),
      };
    }

    case 'long-exercise': {
      const exerciseData = validateExerciseData(data['exercise'], path);
      if (Array.isArray(exerciseData)) {
        throw new Error(
          `[${path}] frontmatter.long_exercise must reference a single exercise object, not an array`
        );
      }
      const longEx = data['long_exercise'] as RawFrontmatter;
      if (!longEx) throw new Error(`[${path}] frontmatter.long_exercise is required`);
      const prompt = optionalString(data, 'prompt');
      if (
        !prompt &&
        (exerciseData.kind === 'drag-drop' || exerciseData.kind === 'matching') &&
        !exerciseData.instructions
      ) {
        throw new Error(
          `[${path}] at least one of frontmatter.prompt or exercise.instructions must be provided`
        );
      }
      return {
        ...base,
        lesson_type: 'long-exercise',
        gate_required: true,
        prompt,
        attempts_allowed: requireNumber(data, 'attempts_allowed', path),
        reflection_prompt: optionalString(data, 'reflection_prompt'),
        long_exercise: {
          expected_duration_minutes: requireNumber(longEx, 'expected_duration_minutes', path),
          scoring_mode:
            (longEx['scoring_mode'] as 'all-or-nothing' | 'partial') ?? 'all-or-nothing',
        },
        exercise: exerciseData,
      };
    }
  }
}

// Local type alias used inside switch
type IllustrationTable = {
  caption: string;
  columns: string[];
  rows: Array<{ id: string; cells: string[] }>;
  hidden_column_indexes?: number[];
};
