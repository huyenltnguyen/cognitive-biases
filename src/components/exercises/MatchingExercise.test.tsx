import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchingExercise } from './MatchingExercise';
import type { MatchingExerciseData } from '../../types/content';

const matchingExercise: MatchingExerciseData = {
  kind: 'matching',
  instructions: 'Match each left item to a right item.',
  left_items: [
    { id: 'a', label: 'Item A' },
    { id: 'b', label: 'Item B' },
    { id: 'c', label: 'Item C' },
  ],
  right_items: [
    { id: 'x', label: 'Option X' },
    { id: 'y', label: 'Option Y' },
  ],
  correct_pairs: [
    { left_id: 'a', right_id: 'x' },
    { left_id: 'b', right_id: 'x' },
    { left_id: 'c', right_id: 'y' },
  ],
};

describe('MatchingExercise', () => {
  it('supports mapping multiple left items to the same right item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MatchingExercise exercise={matchingExercise} onChange={onChange} disabled={false} />);
    const cardA = screen.getByText('Item A').closest('article');
    const cardB = screen.getByText('Item B').closest('article');

    await user.click(within(cardA!).getByRole('button', { name: 'Option X' }));
    expect(onChange).toHaveBeenLastCalledWith([['a', 'x']]);

    await user.click(within(cardB!).getByRole('button', { name: 'Option X' }));
    expect(onChange).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        ['a', 'x'],
        ['b', 'x'],
      ])
    );
  });

  it('allows reassigning a left item to a different right', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MatchingExercise exercise={matchingExercise} onChange={onChange} disabled={false} />);
    const cardA = screen.getByText('Item A').closest('article');

    await user.click(within(cardA!).getByRole('button', { name: 'Option X' }));
    await user.click(within(cardA!).getByRole('button', { name: 'Option Y' }));

    expect(onChange).toHaveBeenLastCalledWith(expect.arrayContaining([['a', 'y']]));
    expect(onChange).not.toHaveBeenLastCalledWith(expect.arrayContaining([['a', 'x']]));
  });

  it('unpairs a left item when clicking same choice twice', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<MatchingExercise exercise={matchingExercise} onChange={onChange} disabled={false} />);
    const cardA = screen.getByText('Item A').closest('article');

    await user.click(within(cardA!).getByRole('button', { name: 'Option X' }));
    await user.click(within(cardA!).getByRole('button', { name: 'Option X' }));

    expect(onChange).toHaveBeenLastCalledWith([]);
  });
});
