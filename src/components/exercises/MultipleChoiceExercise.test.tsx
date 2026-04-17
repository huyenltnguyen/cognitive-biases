import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';
import type { MultipleChoiceExerciseData } from '../../types/content';

const singleExercise: MultipleChoiceExerciseData = {
  kind: 'multiple-choice',
  mode: 'single',
  question: 'Which option is correct?',
  options: [
    { id: 'a', label: 'Option A' },
    { id: 'b', label: 'Option B' },
    { id: 'c', label: 'Option C' },
  ],
  correct_option_ids: ['b'],
};

const multiExercise: MultipleChoiceExerciseData = {
  kind: 'multiple-choice',
  mode: 'multi',
  question: 'Select all correct options',
  options: [
    { id: 'a', label: 'Option A' },
    { id: 'b', label: 'Option B' },
    { id: 'c', label: 'Option C' },
  ],
  correct_option_ids: ['a', 'c'],
};

describe('MultipleChoiceExercise — single', () => {
  it('should render the question and all options', () => {
    render(
      <MultipleChoiceExercise exercise={singleExercise} onChange={vi.fn()} disabled={false} />
    );
    expect(screen.getByText('Which option is correct?')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('should render radio inputs for single mode', () => {
    render(
      <MultipleChoiceExercise exercise={singleExercise} onChange={vi.fn()} disabled={false} />
    );
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
  });

  it('should call onChange when an option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultipleChoiceExercise exercise={singleExercise} onChange={onChange} disabled={false} />
    );
    await user.click(screen.getByLabelText('Option B'));
    expect(onChange).toHaveBeenCalledWith(['b']);
  });

  it('should not allow selection when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultipleChoiceExercise exercise={singleExercise} onChange={onChange} disabled={true} />
    );
    const radio = screen.getByLabelText('Option A');
    expect(radio).toBeDisabled();
    await user.click(radio);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('should show only one selection when mode is single', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultipleChoiceExercise exercise={singleExercise} onChange={onChange} disabled={false} />
    );
    await user.click(screen.getByLabelText('Option A'));
    await user.click(screen.getByLabelText('Option B'));
    // Last call should be only ['b']
    expect(onChange).toHaveBeenLastCalledWith(['b']);
  });
});

describe('MultipleChoiceExercise — multi', () => {
  it('should render checkboxes for multi mode', () => {
    render(
      <MultipleChoiceExercise exercise={multiExercise} onChange={vi.fn()} disabled={false} />
    );
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('should allow multiple selections', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultipleChoiceExercise exercise={multiExercise} onChange={onChange} disabled={false} />
    );
    await user.click(screen.getByLabelText('Option A'));
    await user.click(screen.getByLabelText('Option C'));
    expect(onChange).toHaveBeenLastCalledWith(expect.arrayContaining(['a', 'c']));
  });

  it('should deselect an option when clicked again', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultipleChoiceExercise exercise={multiExercise} onChange={onChange} disabled={false} />
    );
    await user.click(screen.getByLabelText('Option A'));
    await user.click(screen.getByLabelText('Option A'));
    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});