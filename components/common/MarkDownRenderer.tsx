// components/common/MarkdownRenderer.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'; // A popular dark theme
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown (tables, task lists)
import rehypeRaw from 'rehype-raw'; // To allow raw HTML if needed (use with caution)

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose dark:prose-invert max-w-none text-base leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]} // Be cautious with rehypeRaw, only if you trust the markdown source
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula} // Apply the chosen theme
                language={match[1]}
                PreTag="div" // Render as a div
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // You can customize other elements like tables, links, etc.
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{children}</td>
          ),
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            // Use Next.js Image component for optimization if you are rendering images from Markdown
            // Note: This example uses regular <img> for simplicity with ReactMarkdown.
            // For proper Next/Image, you might need a custom image component and configure next.config.js for domains.
            <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-4" />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}