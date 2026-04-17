import { useState } from 'react';
import type { MatchingExerciseData } from '../../types/content';
import styles from './MatchingExercise.module.css';

interface MatchingExerciseProps {
  exercise: MatchingExerciseData;
  onChange: (pairs: Array<[string, string]>) => void;
  disabled: boolean;
}

export function MatchingExercise({ exercise, onChange, disabled }: MatchingExerciseProps) {
  const [pairs, setPairs] = useState<Array<[string, string]>>([]);

  function getPairedRight(leftId: string): string | null {
    return pairs.find(([l]) => l === leftId)?.[1] ?? null;
  }

  function handleChoice(leftId: string, rightId: string) {
    if (disabled) return;

    const currentRight = getPairedRight(leftId);
    if (currentRight === rightId) {
      const next: Array<[string, string]> = pairs.filter(([l]) => l !== leftId);
      setPairs(next);
      onChange(next);
      return;
    }

    const next: Array<[string, string]> = [...pairs.filter(([l]) => l !== leftId), [leftId, rightId]];
    setPairs(next);
    onChange(next);
  }

  const matchedCount = pairs.length;

  return (
    <div className={styles.container}>
      {exercise.instructions && <p className={styles.instructions}>{exercise.instructions}</p>}

      <div className={styles.cards}>
        {exercise.left_items.map((item) => {
          const assignedRight = getPairedRight(item.id);

          return (
            <article
              key={item.id}
              className={styles.card}
              role="group"
              aria-labelledby={`${item.id}-label`}
            >
              <p id={`${item.id}-label`} className={styles.cardText}>
                {item.label}
              </p>
              <div className={styles.choiceRow}>
                {exercise.right_items.map((target) => {
                  const isActive = assignedRight === target.id;
                  return (
                    <button
                      key={target.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleChoice(item.id, target.id)}
                      aria-pressed={isActive}
                      className={`${styles.categoryBtn} ${isActive ? styles.categoryBtnActive : ''} ${disabled ? styles.itemDisabled : ''}`}
                    >
                      {target.label}
                    </button>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.summary} aria-live="polite">
        <p className={styles.summaryText}>
          {matchedCount} of {exercise.left_items.length} scenarios classified
        </p>
      </div>
    </div>
  );
}
