import React from 'react';
import { ChatMessage, LLMContent } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ResponseMessage } from './ResponseMessage'; // Handles markdown, image, etc.
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  onContentClick?: (content: LLMContent) => void;
  isClickable?: boolean;
}

export function MessageBubble({ message, onContentClick, isClickable = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex items-start gap-3 max-w-[90%] break-words',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      <Card
        className={cn(
          'p-4 shadow-sm transition-all duration-300',
          'min-w-[150px]',
          isUser
            ? 'message-user'
            : 'message-assistant'
        )}
      >
        <CardContent className="p-0 text-sm leading-relaxed">
          {message.content.map((contentBlock, index) => (
            <ResponseMessage 
              key={index} 
              content={contentBlock} 
              onContentClick={onContentClick}
              isClickable={isClickable && !isUser}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
