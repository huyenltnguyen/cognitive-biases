import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseWrapper } from './ExerciseWrapper';
import type { MultipleChoiceExerciseData } from '../../types/content';

const gradedExercise: MultipleChoiceExerciseData = {
  kind: 'multiple-choice',
  mode: 'single',
  question: 'Which answer is correct?',
  options: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ],
  correct_option_ids: ['b'],
};

describe('ExerciseWrapper', () => {
  it('allows a user to retry after submitting an answer when attempts remain', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <ExerciseWrapper
        exercise={gradedExercise}
        isGraded={true}
        attemptsAllowed={2}
        lessonId="lesson-1"
        onComplete={onComplete}
        alreadyCompleted={false}
      />
    );

    await user.click(screen.getByLabelText('A'));
    const submitButton = screen.getByRole('button', { name: 'Submit' });
    await user.click(submitButton);

    expect(onComplete).not.toHaveBeenCalled();

    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('keeps exercise enabled for unlimited attempts (-1) after submit', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <ExerciseWrapper
        exercise={gradedExercise}
        isGraded={true}
        attemptsAllowed={-1}
        lessonId="lesson-1"
        onComplete={onComplete}
        alreadyCompleted={false}
      />
    );

    await user.click(screen.getByLabelText('A'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('does not show Try Again after correct graded answer', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <ExerciseWrapper
        exercise={gradedExercise}
        isGraded={true}
        attemptsAllowed={2}
        lessonId="lesson-1"
        onComplete={onComplete}
        alreadyCompleted={false}
      />
    );

    await user.click(screen.getByLabelText('B'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onComplete).toHaveBeenCalledWith(1);
    expect(screen.queryByRole('button', { name: 'Try Again' })).toBeNull();
  });

  it('changes Submit to Continue and calls onContinue after passing final exercise step', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const onContinue = vi.fn();

    render(
      <ExerciseWrapper
        exercise={gradedExercise}
        isGraded={true}
        attemptsAllowed={2}
        lessonId="lesson-1"
        onComplete={onComplete}
        onContinue={onContinue}
        alreadyCompleted={false}
      />
    );

    await user.click(screen.getByLabelText('B'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    expect(continueButton).toBeInTheDocument();
    expect(onComplete).toHaveBeenCalledWith(1);

    await user.click(continueButton);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('submits ungraded multi-select and calls onComplete', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <ExerciseWrapper
        exercise={{
          kind: 'multiple-choice',
          mode: 'multi',
          question: 'Choose any',
          options: [
            { id: 'x', label: 'X' },
            { id: 'y', label: 'Y' },
          ],
        }}
        isGraded={false}
        attemptsAllowed={1}
        lessonId="lesson-1"
        onComplete={onComplete}
        alreadyCompleted={false}
      />
    );

    await user.click(screen.getByLabelText('X'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent(/Response recorded\./i);
    expect(screen.queryByRole('button', { name: 'Try Again' })).toBeNull();
  });

  it('keeps exercise enabled for unlimited attempts (-1) after submit and does not show Infinity attempts', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <ExerciseWrapper
        exercise={gradedExercise}
        isGraded={true}
        attemptsAllowed={-1}
        lessonId="lesson-1"
        onComplete={onComplete}
        alreadyCompleted={false}
      />
    );

    await user.click(screen.getByLabelText('B'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(onComplete).toHaveBeenCalledWith(1);
    expect(screen.queryByRole('button', { name: 'Try Again' })).toBeNull();
    expect(screen.queryByText(/Infinity attempts remaining/)).toBeNull();
  });

  it('locks inputs after incorrect submission until Try Again', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();

    render(
      <ExerciseWrapper
        exercise={gradedExercise}
        isGraded={true}
        attemptsAllowed={2}
        lessonId="lesson-1"
        onComplete={onComplete}
        alreadyCompleted={false}
      />
    );

    // Select incorrect option 'A' and submit
    await user.click(screen.getByLabelText('A'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // onComplete should not be called (attempts remain)
    expect(onComplete).not.toHaveBeenCalled();

    // Inputs should be locked until Try Again
    expect(screen.getByLabelText('A')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();

    // After retry, inputs should be enabled again
    await user.click(screen.getByRole('button', { name: 'Try Again' }));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByLabelText('A')).not.toBeDisabled();
  });

  it('resets submission state when lessonId changes', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    const { rerender } = render(
      <ExerciseWrapper
        exercise={gradedExercise}
        isGraded={true}
        attemptsAllowed={2}
        lessonId="lesson-1"
        onComplete={onComplete}
        alreadyCompleted={false}
      />
    );

    await user.click(screen.getByLabelText('A'));
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();

    rerender(
      <ExerciseWrapper
        exercise={gradedExercise}
        isGraded={true}
        attemptsAllowed={2}
        lessonId="lesson-2"
        onComplete={onComplete}
        alreadyCompleted={false}
      />
    );

    expect(screen.queryByRole('button', { name: 'Try Again' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});
