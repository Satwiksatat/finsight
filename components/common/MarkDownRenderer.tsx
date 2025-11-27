// components/common/MarkdownRenderer.tsx
'use client';

import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
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
          code({ className = '', children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            // If className contains a language (e.g. language-js), render with SyntaxHighlighter
            return match ? (
              <SyntaxHighlighter
                style={dracula}
                language={match[1]}
                PreTag="div"
                {...(props as any)}
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
          img: ({ src, alt }) => {
            if (typeof src !== 'string' || src.trim() === '') {
              return null;
            }
            return (
              <div className="my-4 w-full">
                <Image
                  src={src}
                  alt={alt ?? ''}
                  width={800}
                  height={450}
                  className="h-auto w-full rounded-lg object-contain"
                />
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}