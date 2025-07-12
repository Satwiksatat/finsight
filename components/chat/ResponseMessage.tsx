// components/chat/ResponseMessage.tsx
import React from 'react';
import { LLMContent, TextContent, CodeContent, ChartContent, ImageContent } from '@/lib/types';
import { MarkdownRenderer } from '@/components/common/MarkDownRenderer';
import { ChartDisplay } from '@/components/common/ChartDisplay';
import { ImageDisplay } from '@/components/common/ImageDisplay';

interface ResponseMessageProps {
  content: LLMContent;
}

export function ResponseMessage({ content }: ResponseMessageProps) {
  switch (content.type) {
    case 'text':
      return <MarkdownRenderer content={(content as TextContent).content} />;
    case 'code':
      // Wrap code content in markdown for MarkdownRenderer to handle syntax highlighting
      const codeBlock = content as CodeContent;
      return (
        <MarkdownRenderer content={`\`\`\`${codeBlock.language}\n${codeBlock.content}\n\`\`\``} />
      );
    case 'chart':
      return null; // Chart is displayed in split screen
    case 'image':
      return <ImageDisplay imageData={content as ImageContent} />;
    default:
      return <div className="text-muted-foreground">Unsupported content type: {content.type}</div>;
  }
}