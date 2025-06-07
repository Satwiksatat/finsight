// components/chat/MessageBubble.tsx
import React from 'react';
import { ChatMessage } from '@/lib/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ResponseMessage } from './ResponseMessage'; // Import the new component
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex items-start gap-3 max-w-[80%] break-words',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      <Avatar className={cn('h-8 w-8', isUser ? 'bg-primary/10' : 'bg-accent/10')}>
        <AvatarFallback>{isUser ? 'You' : 'Bot'}</AvatarFallback>
      </Avatar>
      <Card className={cn(
        'p-3',
        isUser ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-muted-foreground rounded-bl-none'
      )}>
        <CardContent className="p-0 text-sm">
          {message.content.map((contentBlock, index) => (
            <ResponseMessage key={index} content={contentBlock} />
          ))}
          <div className="text-xs text-right opacity-70 mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}