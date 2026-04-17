import type {
  GradedExerciseData,
  MultipleChoiceExerciseData,
  DragDropExerciseData,
  MatchingExerciseData,
  SliderExerciseData,
} from '../types/content';

export type ExerciseAnswer = string[] | Record<string, string> | Array<[string, string]> | number;

export interface GradeResult {
  score: number;
  passed: boolean;
  feedback: string[];
}

function gradeMultipleChoice(exercise: MultipleChoiceExerciseData, answer: string[]): GradeResult {
  const correct = exercise.correct_option_ids ?? [];

  if (exercise.mode === 'single') {
    const selected = answer[0] ?? '';
    const passed = correct.includes(selected);
    const option = exercise.options.find((o) => o.id === selected);
    const feedback = option?.explanation
      ? [option.explanation]
      : [passed ? 'Correct!' : 'Incorrect. Try again.'];
    return { score: passed ? 1 : 0, passed, feedback };
  }

  // multi-select
  const allCorrectSelected = correct.every((id) => answer.includes(id));
  const noIncorrectSelected = answer.every((id) => correct.includes(id));
  const passed = allCorrectSelected && noIncorrectSelected;
  const score = passed ? 1 : correct.filter((id) => answer.includes(id)).length / correct.length;

  return {
    score,
    passed,
    feedback: passed
      ? ['All correct!', ...(exercise.success_feedback ? [exercise.success_feedback] : [])]
      : ['Some selections are incorrect. Try again.'],
  };
}

function gradeDragDrop(
  exercise: DragDropExerciseData,
  answer: Record<string, string>
): GradeResult {
  let correctCount = 0;
  let total = 0;

  for (const target of exercise.targets) {
    for (const acceptedId of target.accepts_item_ids) {
      total++;
      if (answer[acceptedId] === target.id) {
        correctCount++;
      }
    }
  }

  const score = total > 0 ? correctCount / total : 0;
  const passed = score >= 1;
  return {
    score,
    passed,
    feedback: [
      passed
        ? (exercise.success_feedback ?? 'Great work! All items placed correctly.')
        : `${correctCount} of ${total} correct.`,
    ],
  };
}

function gradeMatching(
  exercise: MatchingExerciseData,
  answer: Array<[string, string]>
): GradeResult {
  const correct = exercise.correct_pairs ?? [];
  if (correct.length === 0) {
    return { score: 1, passed: true, feedback: [] };
  }

  let correctCount = 0;
  for (const pair of correct) {
    const found = answer.find(([l, r]) => l === pair.left_id && r === pair.right_id);
    if (found) correctCount++;
  }

  const score = correctCount / correct.length;
  const passed = score >= 1;
  return {
    score,
    passed,
    feedback: [
      passed
        ? 'All pairs matched correctly!'
        : `${correctCount} of ${correct.length} pairs correct.`,
    ],
  };
}

function gradeSlider(exercise: SliderExerciseData, answer: number): GradeResult {
  if (exercise.correct_min === undefined || exercise.correct_max === undefined) {
    return { score: 1, passed: true, feedback: ['Thanks for your response.'] };
  }
  const passed = answer >= exercise.correct_min && answer <= exercise.correct_max;
  return {
    score: passed ? 1 : 0,
    passed,
    feedback: [
      passed
        ? `Correct! The answer falls between ${exercise.correct_min} and ${exercise.correct_max}.`
        : `The correct range is ${exercise.correct_min}–${exercise.correct_max}.`,
    ],
  };
}

export function gradeExercise(
  exerciseData: GradedExerciseData,
  answer: ExerciseAnswer
): GradeResult {
  switch (exerciseData.kind) {
    case 'multiple-choice':
      return gradeMultipleChoice(exerciseData, answer as string[]);
    case 'drag-drop':
      return gradeDragDrop(exerciseData, answer as Record<string, string>);
    case 'matching':
      return gradeMatching(exerciseData, answer as Array<[string, string]>);
    case 'slider':
      return gradeSlider(exerciseData, answer as number);
  }
}
