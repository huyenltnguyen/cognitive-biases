import { describe, it, expect } from 'vitest';
import { gradeExercise } from './grade';
import type {
  MultipleChoiceExerciseData,
  DragDropExerciseData,
  MatchingExerciseData,
  SliderExerciseData,
} from '../types/content';

describe('gradeExercise — multiple-choice single', () => {
  const exercise: MultipleChoiceExerciseData = {
    kind: 'multiple-choice',
    mode: 'single',
    question: 'Which is correct?',
    options: [
      { id: 'a', label: 'Option A', explanation: 'A is right!' },
      { id: 'b', label: 'Option B' },
    ],
    correct_option_ids: ['a'],
  };

  it('should return passed: true and score: 1 for correct answer', () => {
    const result = gradeExercise(exercise, ['a']);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(1);
  });

  it('should return passed: false and score: 0 for wrong answer', () => {
    const result = gradeExercise(exercise, ['b']);
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
  });

  it('should include explanation in feedback when option has one', () => {
    const result = gradeExercise(exercise, ['a']);
    expect(result.feedback).toContain('A is right!');
  });

  it('should return empty selection as incorrect', () => {
    const result = gradeExercise(exercise, []);
    expect(result.passed).toBe(false);
  });
});

describe('gradeExercise — multiple-choice multi', () => {
  const exercise: MultipleChoiceExerciseData = {
    kind: 'multiple-choice',
    mode: 'multi',
    question: 'Select all correct options',
    options: [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
      { id: 'c', label: 'C' },
    ],
    correct_option_ids: ['a', 'c'],
  };

  it('should pass when all correct options are selected and no extras', () => {
    const result = gradeExercise(exercise, ['a', 'c']);
    expect(result.passed).toBe(true);
  });

  it('should fail when an incorrect option is selected', () => {
    const result = gradeExercise(exercise, ['a', 'b', 'c']);
    expect(result.passed).toBe(false);
  });

  it('should fail when only one of two correct options is selected', () => {
    const result = gradeExercise(exercise, ['a']);
    expect(result.passed).toBe(false);
  });
});

describe('gradeExercise — drag-drop', () => {
  const exercise: DragDropExerciseData = {
    kind: 'drag-drop',
    instructions: 'Place each item in its category',
    items: [
      { id: 'item1', label: 'Item 1' },
      { id: 'item2', label: 'Item 2' },
    ],
    targets: [
      { id: 'target1', label: 'Category 1', accepts_item_ids: ['item1'] },
      { id: 'target2', label: 'Category 2', accepts_item_ids: ['item2'] },
    ],
  };

  it('should pass when all items are in correct targets', () => {
    const result = gradeExercise(exercise, { item1: 'target1', item2: 'target2' });
    expect(result.passed).toBe(true);
    expect(result.score).toBe(1);
  });

  it('should fail with partial score when some items are misplaced', () => {
    const result = gradeExercise(exercise, { item1: 'target2', item2: 'target2' });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0.5);
  });

  it('should fail with score 0 when all items are wrong', () => {
    const result = gradeExercise(exercise, { item1: 'target2', item2: 'target1' });
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
  });
});

describe('gradeExercise — matching', () => {
  const exercise: MatchingExerciseData = {
    kind: 'matching',
    instructions: 'Match each term',
    left_items: [
      { id: 'l1', label: 'Left 1' },
      { id: 'l2', label: 'Left 2' },
    ],
    right_items: [
      { id: 'r1', label: 'Right 1' },
      { id: 'r2', label: 'Right 2' },
    ],
    correct_pairs: [
      { left_id: 'l1', right_id: 'r1' },
      { left_id: 'l2', right_id: 'r2' },
    ],
  };

  it('should pass when all pairs are correct', () => {
    const result = gradeExercise(exercise, [['l1', 'r1'], ['l2', 'r2']]);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(1);
  });

  it('should fail when pairs are swapped', () => {
    const result = gradeExercise(exercise, [['l1', 'r2'], ['l2', 'r1']]);
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0);
  });

  it('should give partial score for partial correct pairs', () => {
    const result = gradeExercise(exercise, [['l1', 'r1']]);
    expect(result.passed).toBe(false);
    expect(result.score).toBe(0.5);
  });

  it('should auto-pass when no correct_pairs defined', () => {
    const noAnswerExercise: MatchingExerciseData = { ...exercise, correct_pairs: undefined };
    const result = gradeExercise(noAnswerExercise, []);
    expect(result.passed).toBe(true);
  });
});

describe('gradeExercise — slider', () => {
  const exercise: SliderExerciseData = {
    kind: 'slider',
    question: 'How likely?',
    min: 0,
    max: 100,
    step: 1,
    correct_min: 60,
    correct_max: 80,
  };

  it('should pass when value is within correct range', () => {
    const result = gradeExercise(exercise, 70);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(1);
  });

  it('should pass at the boundary values', () => {
    expect(gradeExercise(exercise, 60).passed).toBe(true);
    expect(gradeExercise(exercise, 80).passed).toBe(true);
  });

  it('should fail when value is outside range', () => {
    expect(gradeExercise(exercise, 50).passed).toBe(false);
    expect(gradeExercise(exercise, 90).passed).toBe(false);
  });

  it('should auto-pass when no correct range defined', () => {
    const openExercise: SliderExerciseData = { ...exercise, correct_min: undefined, correct_max: undefined };
    const result = gradeExercise(openExercise, 50);
    expect(result.passed).toBe(true);
  });
});