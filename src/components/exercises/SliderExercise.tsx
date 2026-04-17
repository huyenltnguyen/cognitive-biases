import { useState, useId, useEffect } from 'react';
import type { SliderExerciseData } from '../../types/content';
import styles from './SliderExercise.module.css';

interface SliderExerciseProps {
  exercise: SliderExerciseData;
  onChange: (value: number) => void;
  disabled: boolean;
}

export function SliderExercise({ exercise, onChange, disabled }: SliderExerciseProps) {
  const sliderId = useId();
  const outputId = useId();
  const initialValue = Math.round((exercise.min + exercise.max) / 2 / exercise.step) * exercise.step;
  const [value, setValue] = useState<number>(initialValue);

  useEffect(() => {
    onChange(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const num = Number(e.target.value);
    setValue(num);
    onChange(num);
  }

  const rangePercent =
    exercise.max > exercise.min
      ? ((value - exercise.min) / (exercise.max - exercise.min)) * 100
      : 0;

  const formattedValue = exercise.unit ? `${value} ${exercise.unit}` : String(value);

  return (
    <div className={styles.container}>
      <label htmlFor={sliderId} className={styles.question}>
        {exercise.question}
      </label>

      <div className={styles.sliderWrapper}>
        <span className={styles.bound} aria-hidden="true">
          {exercise.min}{exercise.unit ? ` ${exercise.unit}` : ''}
        </span>

        <div className={styles.trackWrapper}>
          <input
            id={sliderId}
            type="range"
            min={exercise.min}
            max={exercise.max}
            step={exercise.step}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className={styles.slider}
            aria-valuemin={exercise.min}
            aria-valuemax={exercise.max}
            aria-valuenow={value}
            aria-valuetext={formattedValue}
            aria-controls={outputId}
            style={{ '--range-percent': `${rangePercent}%` } as React.CSSProperties}
          />
        </div>

        <span className={styles.bound} aria-hidden="true">
          {exercise.max}{exercise.unit ? ` ${exercise.unit}` : ''}
        </span>
      </div>

      <output
        id={outputId}
        htmlFor={sliderId}
        className={styles.valueDisplay}
        aria-live="polite"
      >
        {formattedValue}
      </output>
    </div>
  );
}