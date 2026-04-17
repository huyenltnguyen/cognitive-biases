import type { ComponentType } from 'react';
import { renderMarkdown } from '../../utils/markdown-pipeline';
import styles from './MarkdownRenderer.module.css';

interface MarkdownRendererProps {
  markdown: string;
  className?: string;
  components?: Record<string, ComponentType<Record<string, unknown>>>;
}

export function MarkdownRenderer({ markdown, className, components }: MarkdownRendererProps) {
  const content = renderMarkdown(markdown, components);
  return (
    <div className={`${styles.prose} ${className ?? ''}`}>
      {content}
    </div>
  );
}
