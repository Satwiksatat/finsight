// components/chat/ResponseMessage.tsx
import React from 'react';
import { LLMContent, TextContent, CodeContent, ChartContent, ImageContent } from '@/lib/types';
import { MarkdownRenderer } from '@/components/common/MarkDownRenderer';
import { ImageDisplay } from '@/components/common/ImageDisplay';

interface ResponseMessageProps {
  content: LLMContent;
  onContentClick?: (content: LLMContent) => void;
  isClickable?: boolean;
}

export function ResponseMessage({ content, onContentClick, isClickable = false }: ResponseMessageProps) {
  const handleClick = () => {
    if (isClickable && onContentClick) {
      onContentClick(content);
    }
  };

  const renderContent = () => {
    switch (content.type) {
      case 'text':
        const textContent = (content as TextContent).content;
        // Special handling for chart message
        if (textContent === '[Chart displayed in split screen]') {
          return (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-blue-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Chart Available</p>
                <p className="text-xs text-muted-foreground">Click to view chart in split screen</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4 text-muted-foreground">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          );
        }
        return <MarkdownRenderer content={textContent} />;
      case 'code':
        // Wrap code content in markdown for MarkdownRenderer to handle syntax highlighting
        const codeBlock = content as CodeContent;
        return (
          <MarkdownRenderer content={`\`\`\`${codeBlock.language}\n${codeBlock.content}\n\`\`\``} />
        );
      case 'chart':
        return (
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Chart Available</p>
              <p className="text-xs text-muted-foreground">
                {(content as ChartContent).title || 'Interactive chart visualization'}
              </p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4 text-muted-foreground">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </div>
        );
      case 'image':
        return <ImageDisplay imageData={content as ImageContent} />;
      default:
        return <div className="text-muted-foreground">Unsupported content type: {content.type}</div>;
    }
  };

  if (isClickable && (content.type === 'chart' || content.type === 'image' || content.type === 'code' || 
      (content.type === 'text' && (content as TextContent).content === '[Chart displayed in split screen]'))) {
    return (
      <button
        onClick={handleClick}
        className="w-full text-left transition-all duration-200 hover:bg-muted/50 rounded-lg group"
      >
        {renderContent()}
      </button>
    );
  }

  return <div>{renderContent()}</div>;
}