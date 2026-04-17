import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { DragDropExerciseData, DragDropItem, DragDropTarget } from '../../types/content';
import styles from './DragDropExercise.module.css';

interface DraggableItemProps {
  item: DragDropItem;
  disabled: boolean;
  isPlaced: boolean;
}

function DraggableItem({ item, disabled, isPlaced }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: disabled || isPlaced,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${styles.draggableItem} ${isDragging ? styles.dragging : ''} ${isPlaced ? styles.placed : ''} ${disabled ? styles.itemDisabled : ''}`}
      aria-label={`Drag: ${item.label}`}
      aria-roledescription="Draggable item"
      tabIndex={disabled || isPlaced ? -1 : 0}
    >
      <span className={styles.dragHandle} aria-hidden="true">⠿</span>
      <span>{item.label}</span>
    </div>
  );
}

interface DroppableTargetProps {
  target: DragDropTarget;
  placedItems: DragDropItem[];
  onRemove: (itemId: string) => void;
  disabled: boolean;
}

function DroppableTarget({ target, placedItems, onRemove, disabled }: DroppableTargetProps) {
  const { setNodeRef, isOver } = useDroppable({ id: target.id });

  return (
    <div
      ref={setNodeRef}
      className={`${styles.droppableTarget} ${isOver ? styles.dropOver : ''} ${placedItems.length > 0 ? styles.filled : ''}`}
      aria-label={`Drop zone: ${target.label}`}
      aria-dropeffect="move"
    >
      <span className={styles.targetLabel}>{target.label}</span>
      {placedItems.length > 0 ? (
        placedItems.map((item) => (
          <div key={item.id} className={styles.placedItem}>
            <span>{item.label}</span>
            {!disabled && (
              <button
                onClick={() => onRemove(item.id)}
                className={styles.removeBtn}
                aria-label={`Remove ${item.label} from ${target.label}`}
                type="button"
              >
                ×
              </button>
            )}
          </div>
        ))
      ) : (
        <span className={styles.emptyHint} aria-hidden="true">Drop here</span>
      )}
    </div>
  );
}

interface DragDropExerciseProps {
  exercise: DragDropExerciseData;
  onChange: (placements: Record<string, string>) => void;
  disabled: boolean;
}

export function DragDropExercise({ exercise, onChange, disabled }: DragDropExerciseProps) {
  const [placements, setPlacements] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over) {
      const newPlacements = {
        ...placements,
        [active.id as string]: over.id as string,
      };
      setPlacements(newPlacements);
      onChange(newPlacements);
    }
  }

  function handleRemove(itemId: string) {
    const next = { ...placements };
    delete next[itemId];
    setPlacements(next);
    onChange(next);
  }

  const placedItemIds = new Set(Object.keys(placements));

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={styles.container}>
        {exercise.instructions && <p className={styles.instructions}>{exercise.instructions}</p>}

        <div className={styles.layout}>
          <section className={styles.itemsSection} aria-label="Items to place">
            <h3 className={styles.sectionLabel}>Items</h3>
            <div className={styles.itemsList}>
              {exercise.items.map((item) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  disabled={disabled}
                  isPlaced={placedItemIds.has(item.id)}
                />
              ))}
            </div>
          </section>

          <section className={styles.targetsSection} aria-label="Drop zones">
            <h3 className={styles.sectionLabel}>Drop Zones</h3>
            <div className={styles.targetsList}>
              {exercise.targets.map((target) => {
                const placedItems = Object.entries(placements)
                  .filter(([, tid]) => tid === target.id)
                  .map(([itemId]) => exercise.items.find((i) => i.id === itemId))
                  .filter((item): item is DragDropItem => item !== undefined);

                return (
                  <DroppableTarget
                    key={target.id}
                    target={target}
                    placedItems={placedItems}
                    onRemove={handleRemove}
                    disabled={disabled}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </DndContext>
  );
}