import React from 'react';
import { ChatMessage } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ResponseMessage } from './ResponseMessage'; // Handles markdown, image, etc.
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
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
          'p-4 rounded-xl shadow-sm',
          'min-w-[150px]',
          isUser
            ? 'bg-[hsl(var(--accent))] text-[hsl(var(--foreground))]'
            : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))]'
        )}
      >
        <CardContent className="p-0 text-sm leading-relaxed">
          {message.content.map((contentBlock, index) => (
            <ResponseMessage key={index} content={contentBlock} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
