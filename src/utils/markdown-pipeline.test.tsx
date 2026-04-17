import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import type { ComponentType } from 'react';
import { renderMarkdown } from './markdown-pipeline';

describe('renderMarkdown', () => {
  it('renders basic markdown to a React node', () => {
    const result = renderMarkdown('# Hello');
    expect(result).toBeDefined();
  });

  it('renders with custom heading component when provided', () => {
    const CustomH1 = ({ children }: { children: React.ReactNode }) => (
      <h1 data-testid="custom-h1">{children}</h1>
    );
    const result = renderMarkdown('# Hello', { h1: CustomH1 as ComponentType<Record<string, unknown>> });
    const { getByTestId } = render(<>{result}</>);
    expect(getByTestId('custom-h1')).toBeInTheDocument();
  });

  it('renders without custom components when none provided', () => {
    const result1 = renderMarkdown('# Hello');
    const result2 = renderMarkdown('# Hello', {});
    expect(result1).toBeDefined();
    expect(result2).toBeDefined();
  });
});
