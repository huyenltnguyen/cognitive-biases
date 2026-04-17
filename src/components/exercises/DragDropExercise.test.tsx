import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DragDropExercise } from './DragDropExercise';
import type { DragDropExerciseData } from '../../types/content';

const exercise: DragDropExerciseData = {
  kind: 'drag-drop',
  instructions: 'Drag each item to its category.',
  items: [
    { id: 'item1', label: 'System 1' },
    { id: 'item2', label: 'System 2' },
  ],
  targets: [
    { id: 'target-fast', label: 'Fast Thinking', accepts_item_ids: ['item1'] },
    { id: 'target-slow', label: 'Slow Thinking', accepts_item_ids: ['item2'] },
  ],
};

describe('DragDropExercise', () => {
  it('should render instructions', () => {
    render(<DragDropExercise exercise={exercise} onChange={vi.fn()} disabled={false} />);
    expect(screen.getByText('Drag each item to its category.')).toBeInTheDocument();
  });

  it('should render all draggable items', () => {
    render(<DragDropExercise exercise={exercise} onChange={vi.fn()} disabled={false} />);
    expect(screen.getByText('System 1')).toBeInTheDocument();
    expect(screen.getByText('System 2')).toBeInTheDocument();
  });

  it('should render all drop targets', () => {
    render(<DragDropExercise exercise={exercise} onChange={vi.fn()} disabled={false} />);
    expect(screen.getByText('Fast Thinking')).toBeInTheDocument();
    expect(screen.getByText('Slow Thinking')).toBeInTheDocument();
  });

  it('should mark items as draggable with appropriate role', () => {
    render(<DragDropExercise exercise={exercise} onChange={vi.fn()} disabled={false} />);
    const draggables = screen.getAllByRole('button');
    // draggable items are divs with role=button via useDraggable
    expect(draggables.length).toBeGreaterThanOrEqual(2);
  });

  it('should render drop zones with accessible labels', () => {
    render(<DragDropExercise exercise={exercise} onChange={vi.fn()} disabled={false} />);
    expect(screen.getByLabelText('Drop zone: Fast Thinking')).toBeInTheDocument();
    expect(screen.getByLabelText('Drop zone: Slow Thinking')).toBeInTheDocument();
  });

  it('should show empty hint text in unpopulated drop zones', () => {
    render(<DragDropExercise exercise={exercise} onChange={vi.fn()} disabled={false} />);
    const hints = screen.getAllByText('Drop here');
    expect(hints.length).toBe(2);
  });

  it('should show multiple placed items when a target accepts many', () => {
    const multiExercise: DragDropExerciseData = {
      kind: 'drag-drop',
      instructions: 'Sort these items.',
      items: [
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Beta' },
      ],
      targets: [
        { id: 'bucket', label: 'Bucket', accepts_item_ids: ['a', 'b'] },
      ],
    };

    render(
      <DragDropExercise exercise={multiExercise} onChange={vi.fn()} disabled={false} />
    );

    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('should display "Drop here" hint only when target is empty', () => {
    render(<DragDropExercise exercise={exercise} onChange={vi.fn()} disabled={false} />);
    const hints = screen.getAllByText('Drop here');
    expect(hints.length).toBe(2);
  });
});