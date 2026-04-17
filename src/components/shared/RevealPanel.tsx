import { useState, useId } from 'react';
import type { ReactNode } from 'react';
import { Button } from './Button';
import styles from './RevealPanel.module.css';

interface RevealPanelProps {
  label?: string;
  children: ReactNode;
  required?: boolean;
  onReveal?: () => void;
}

export function RevealPanel({
  label = 'Reveal',
  children,
  required = false,
  onReveal,
}: RevealPanelProps) {
  const [revealed, setRevealed] = useState(false);
  const contentId = useId();

  function handleReveal() {
    setRevealed(true);
    onReveal?.();
  }

  return (
    <div className={styles.wrapper}>
      {!revealed && (
        <div className={styles.prompt}>
          <Button
            onClick={handleReveal}
            type="button"
            variant="secondary"
            aria-expanded={false}
            aria-controls={contentId}
          >
            {label}
          </Button>
          {required && <p className={styles.hint}>You must reveal this content to continue.</p>}
        </div>
      )}
      <div
        id={contentId}
        className={`${styles.content} ${revealed ? styles.contentVisible : ''}`}
        aria-live="polite"
        hidden={!revealed}
      >
        {revealed && children}
      </div>
    </div>
  );
}
