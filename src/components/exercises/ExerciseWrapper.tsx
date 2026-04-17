import { useState, useCallback, useEffect } from 'react';
import { Button } from '../shared/Button';
import type { GradedExerciseData } from '../../types/content';
import type { ExerciseAnswer } from '../../utils/grade';
import { gradeExercise } from '../../utils/grade';
import { FeedbackAlert } from '../shared/FeedbackAlert';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';
import { DragDropExercise } from './DragDropExercise';
import { MatchingExercise } from './MatchingExercise';
import { SliderExercise } from './SliderExercise';
import styles from './ExerciseWrapper.module.css';

interface ExerciseWrapperProps {
  exercise: GradedExerciseData | GradedExerciseData[];
  isGraded: boolean;
  attemptsAllowed: number;
  lessonId: string;
  onComplete: (score: number) => void;
  alreadyCompleted: boolean;
  reflectionPrompt?: string;
  onContinue?: () => void;
}

export function ExerciseWrapper({
  exercise,
  isGraded,
  attemptsAllowed,
  lessonId,
  onComplete,
  reflectionPrompt,
  onContinue,
}: ExerciseWrapperProps) {
  const [answer, setAnswer] = useState<ExerciseAnswer | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [gradeResult, setGradeResult] = useState<import('../../utils/grade').GradeResult | null>(
    null
  );
  const [resetKey, setResetKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const exercises = Array.isArray(exercise) ? exercise : [exercise];
  const [scores, setScores] = useState<number[]>([]);

  useEffect(() => {
    setAnswer(null);
    setAttempts(0);
    setSubmitted(false);
    setGradeResult(null);
    setResetKey((prev) => prev + 1);
    setCurrentIndex(0);
    setScores([]);
  }, [lessonId]);
  const isLast = currentIndex >= exercises.length - 1;

  const hasUnlimitedAttempts = attemptsAllowed < 0;
  const attemptsRemaining = hasUnlimitedAttempts
    ? Number.POSITIVE_INFINITY
    : attemptsAllowed - attempts;
  const isOutOfAttempts = !hasUnlimitedAttempts && attemptsRemaining <= 0;

  const isDisabled = isOutOfAttempts;

  // Lock inputs after any submission (success or failure).
  const isSubmissionLocked = submitted && gradeResult !== null;
  const canRetry =
    isGraded && submitted && gradeResult !== null && !gradeResult.passed && attemptsRemaining > 0;
  const shouldShowAttemptsRemaining = isGraded && !hasUnlimitedAttempts;
  const canContinueFromLastStep = submitted && isLast && gradeResult !== null;

  const handleAnswer = useCallback((ans: ExerciseAnswer) => {
    setAnswer(ans);
  }, []);

  function getResultForExercise(ex: GradedExerciseData, ans: ExerciseAnswer) {
    if (!isGraded) {
      return { score: 1, passed: true, feedback: [] };
    }

    switch (ex.kind) {
      case 'multiple-choice':
      case 'drag-drop':
      case 'matching':
      case 'slider':
        return gradeExercise(ex, ans);
      default:
        return { score: 0, passed: false, feedback: ['Unknown exercise kind'] };
    }
  }

  function handleSubmit() {
    if (answer === null) return;

    const currentExercise = exercises[currentIndex];

    if (!submitted) {
      const result = getResultForExercise(currentExercise, answer);
      setGradeResult(result);
      setSubmitted(true);

      if (isGraded) {
        setAttempts((prev) => prev + 1);
      }

      setScores((s) => {
        const next = [...s];
        next[currentIndex] = result.score;
        return next;
      });

      if (isLast && (!isGraded || result.passed || attemptsRemaining <= 0)) {
        const total = [...scores, result.score].reduce((a, b) => a + (b || 0), 0);
        const avg = total / exercises.length;
        onComplete(avg);
      }

      return;
    }

    // Second click (when submitted): act as "Next" and advance to next step.
    if (!gradeResult) return;

    if (isLast) {
      onContinue?.();
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswer(null);
      setSubmitted(false);
      setGradeResult(null);
      setAttempts(0);
      setResetKey((prev) => prev + 1);
    }
  }

  function handleRetry() {
    setAnswer(null);
    setSubmitted(false);
    setGradeResult(null);
    setResetKey((prev) => prev + 1);
  }

  const componentKey = `${exercises[currentIndex].kind}-${resetKey}-${currentIndex}`;

  return (
    <div className={styles.wrapper}>
      <div className={styles.exerciseArea}>
        {exercises[currentIndex].kind === 'multiple-choice' && (
          <MultipleChoiceExercise
            key={componentKey}
            exercise={exercises[currentIndex]}
            onChange={handleAnswer as (ans: string[]) => void}
            disabled={isDisabled || isSubmissionLocked}
          />
        )}
        {exercises[currentIndex].kind === 'drag-drop' && (
          <DragDropExercise
            key={componentKey}
            exercise={exercises[currentIndex]}
            onChange={handleAnswer as (ans: Record<string, string>) => void}
            disabled={isDisabled || isSubmissionLocked}
          />
        )}
        {exercises[currentIndex].kind === 'matching' && (
          <MatchingExercise
            key={componentKey}
            exercise={exercises[currentIndex]}
            onChange={handleAnswer as (ans: Array<[string, string]>) => void}
            disabled={isDisabled || isSubmissionLocked}
          />
        )}
        {exercises[currentIndex].kind === 'slider' && (
          <SliderExercise
            key={componentKey}
            exercise={exercises[currentIndex]}
            onChange={handleAnswer as (ans: number) => void}
            disabled={isDisabled || isSubmissionLocked}
          />
        )}
      </div>

      {submitted && gradeResult && <FeedbackAlert result={gradeResult} />}

      {exercises.length > 1 && (
        <p className={styles.stepInfo}>
          Step {currentIndex + 1} of {exercises.length}
        </p>
      )}

      {reflectionPrompt && (
        <aside className={styles.reflectionPrompt} aria-label="Reflection prompt">
          <p>{reflectionPrompt}</p>
        </aside>
      )}

      <div className={styles.controls}>
        {!isOutOfAttempts && (
          <>
            {shouldShowAttemptsRemaining && (
              <p className={styles.attemptsInfo}>
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
              </p>
            )}
            <div className={styles.buttonGroup}>
              {canRetry && (
                <Button
                  onClick={handleRetry}
                  type="button"
                  variant="secondary"
                  className={styles.submitButton}
                >
                  Try Again
                </Button>
              )}

              <Button
                onClick={handleSubmit}
                disabled={(!canContinueFromLastStep && answer === null) || isDisabled}
                type="button"
                variant="secondary"
                className={styles.submitButton}
              >
                {canContinueFromLastStep ? (
                  <>
                    Continue
                    <span aria-hidden="true" className={styles.continueArrow}>
                      →
                    </span>
                  </>
                ) : submitted && !isLast ? (
                  'Next'
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
