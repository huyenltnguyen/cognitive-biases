import { useState } from 'react';
import type { LessonNode, ReadingLessonFrontmatter } from '../../types/content';
import { MarkdownRenderer } from '../shared/MarkdownRenderer';
import { RevealPanel } from '../shared/RevealPanel';
import { Button } from '../shared/Button';
import styles from './ReadingLesson.module.css';
import illustrationStyles from './IllustrationLesson.module.css';

interface ReadingLessonProps {
  lesson: LessonNode;
  onContinue: () => void;
}

interface RevealTableWithHiddenProps {
  caption: string;
  columns: string[];
  rows: Array<{ id: string; cells: string[] }>;
  hiddenIndexes: number[];
  revealLabel: string;
  revealRequired: boolean;
  ariaDescription: string;
}

function RevealTableWithHidden({
  caption,
  columns,
  rows,
  hiddenIndexes,
  revealLabel,
  revealRequired,
  ariaDescription,
}: RevealTableWithHiddenProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className={illustrationStyles.tableContainer}>
      <div
        className={illustrationStyles.tableWrapper}
        role="region"
        aria-label={ariaDescription}
        tabIndex={0}
      >
        <table>
          <caption className={illustrationStyles.tableCaption}>{caption}</caption>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={
                    !revealed && hiddenIndexes.includes(i) ? illustrationStyles.hiddenCell : ''
                  }
                >
                  {!revealed && hiddenIndexes.includes(i) ? <span aria-hidden="true">—</span> : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell, i) => (
                  <td
                    key={i}
                    className={
                      !revealed && hiddenIndexes.includes(i) ? illustrationStyles.hiddenCell : ''
                    }
                  >
                    {!revealed && hiddenIndexes.includes(i) ? (
                      <span aria-hidden="true">—</span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!revealed && (
        <RevealPanel
          label={revealLabel}
          required={revealRequired}
          onReveal={() => setRevealed(true)}
        >
          <span />
        </RevealPanel>
      )}
    </div>
  );
}

function RevealTable({ frontmatter }: { frontmatter: ReadingLessonFrontmatter }) {
  const illustration = frontmatter.illustration;
  if (!illustration || !illustration.table) return null;

  const { caption, columns, rows, hidden_column_indexes = [] } = illustration.table;

  if (hidden_column_indexes.length === 0) {
    return (
      <div
        className={illustrationStyles.tableWrapper}
        role="region"
        aria-label={illustration.aria_description}
        tabIndex={0}
      >
        <table>
          <caption className={illustrationStyles.tableCaption}>{caption}</caption>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i} scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <RevealTableWithHidden
      caption={caption}
      columns={columns}
      rows={rows}
      hiddenIndexes={hidden_column_indexes}
      revealLabel={illustration.reveal_label ?? 'Reveal Answer'}
      revealRequired={illustration.reveal_required}
      ariaDescription={illustration.aria_description}
    />
  );
}

export function ReadingLesson({ lesson, onContinue }: ReadingLessonProps) {
  const fm = lesson.frontmatter as ReadingLessonFrontmatter;

  return (
    <article className={styles.article} aria-label={fm.title}>
      <header className={styles.header}>
        <div className={styles.meta}>
          <span className={styles.lessonType}>Reading</span>
          <span className={styles.duration}>~{fm.estimated_minutes} min</span>
        </div>
        <h1 className={styles.title}>{fm.title}</h1>
        {fm.reading.summary && <p className={styles.summary}>{fm.reading.summary}</p>}
      </header>

      <MarkdownRenderer markdown={lesson.body_markdown} className={styles.body} />

      {fm.illustration && (
        <div className={illustrationStyles.illustration}>
          <RevealTable frontmatter={fm} />
        </div>
      )}

      {fm.takeaway && (
        <aside className={styles.takeaway} aria-label="Key takeaway">
          <strong className={styles.takeawayLabel}>Key Takeaway</strong>
          <p className={styles.takeawayText}>{fm.takeaway}</p>
        </aside>
      )}

      <div className={styles.controls}>
        <Button
          onClick={onContinue}
          type="button"
          variant="secondary"
          className={styles.continueButton}
        >
          Continue
          <span aria-hidden="true" className={styles.continueArrow}>
            →
          </span>
        </Button>
      </div>
    </article>
  );
}
