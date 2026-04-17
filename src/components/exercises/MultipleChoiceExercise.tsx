import { useState, useId, useEffect, useMemo } from 'react';
import type { MultipleChoiceExerciseData } from '../../types/content';
import styles from './MultipleChoiceExercise.module.css';

interface MultipleChoiceExerciseProps {
  exercise: MultipleChoiceExerciseData;
  onChange: (selected: string[]) => void;
  disabled: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MultipleChoiceExercise({
  exercise,
  onChange,
  disabled,
}: MultipleChoiceExerciseProps) {
  const groupId = useId();
  const [selected, setSelected] = useState<string[]>([]);

  // Recompute (and re-shuffle) options whenever the exercise changes.
  // Using exercise as the dependency ensures a new shuffle per new exercise
  // while preserving order within the same exercise instance.
  const options = useMemo(
    () =>
      exercise.shuffle_options ? shuffleArray(exercise.options) : exercise.options,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercise]
  );

  // Reset selection when the exercise changes.
  useEffect(() => {
    setSelected([]);
  }, [exercise]);

  function handleSingle(optionId: string) {
    if (disabled) return;
    const next = [optionId];
    setSelected(next);
    onChange(next);
  }

  function handleMulti(optionId: string, checked: boolean) {
    if (disabled) return;
    const next = checked
      ? [...selected, optionId]
      : selected.filter((id) => id !== optionId);
    setSelected(next);
    onChange(next);
  }

  const inputType = exercise.mode === 'single' ? 'radio' : 'checkbox';
  const legendId = `${groupId}-legend`;

  return (
    <fieldset className={styles.fieldset} aria-labelledby={legendId}>
      <legend id={legendId} className={styles.question}>
        {exercise.question}
      </legend>
      <ul className={styles.optionList} role="list">
        {options.map((option) => {
          const inputId = `${groupId}-${option.id}`;
          const isChecked = selected.includes(option.id);

          return (
            <li key={option.id} className={styles.optionItem}>
              <label
                htmlFor={inputId}
                className={`${styles.optionLabel} ${isChecked ? styles.optionSelected : ''} ${disabled ? styles.optionDisabled : ''}`}
              >
                <input
                  id={inputId}
                  type={inputType}
                  name={exercise.mode === 'single' ? groupId : undefined}
                  value={option.id}
                  checked={isChecked}
                  disabled={disabled}
                  onChange={(e) => {
                    if (exercise.mode === 'single') {
                      handleSingle(option.id);
                    } else {
                      handleMulti(option.id, e.target.checked);
                    }
                  }}
                  className={styles.input}
                  aria-label={option.label}
                />
                <span className={styles.optionText}>{option.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
