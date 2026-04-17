import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeReact, { type Options as RehypeReactOptions } from 'rehype-react';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';
import type { ComponentType, ReactNode } from 'react';

/**
 * Unified markdown pipeline — extractable as a standalone plugin.
 *
 * Interface contract:
 *   renderMarkdown(markdown: string, components?: Record<string, ComponentType>) → ReactNode
 *
 * Extension point: pass a `components` map to override default HTML element rendering.
 * Example: { h1: MyHeading, a: MyLink }
 *
 * The rehypeSafeLinks plugin strips non-absolute, non-root-relative hrefs to prevent
 * javascript: and data: URI injection.
 */

function rehypeSafeLinks() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'a' && node.properties?.href) {
        const href = String(node.properties.href);
        if (
          !href.startsWith('https://') &&
          !href.startsWith('http://') &&
          !href.startsWith('/') &&
          !href.startsWith('#')
        ) {
          delete node.properties.href;
        }
      }
    });
  };
}

export function createMarkdownProcessor(
  components?: Record<string, ComponentType<Record<string, unknown>>>
) {
  return unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSafeLinks)
    .use(rehypeReact, {
      Fragment,
      jsx: jsx as RehypeReactOptions['jsx'],
      jsxs: jsxs as RehypeReactOptions['jsxs'],
      components: components as RehypeReactOptions['components'],
    });
}

export function renderMarkdown(
  markdown: string,
  components?: Record<string, ComponentType<Record<string, unknown>>>
): ReactNode {
  const processor = createMarkdownProcessor(components);
  const file = processor.processSync(markdown);
  return file.result as ReactNode;
}
