// components/chat/ChatMessages.tsx
'use client';

import React, { useEffect } from 'react';
import { ChatMessage } from '@/lib/types';
import { MessageBubble } from './MessageBubble';

interface ChatMessagesProps {
  messages: ChatMessage[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessages({ messages, messagesEndRef }: ChatMessagesProps) {
  // Debugging effect
  useEffect(() => {
    console.log('Messages in ChatMessages:', {
      count: messages.length,
      sample: messages[0],
      all: messages
    });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No messages yet. Start a conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="flex flex-col space-y-4">
        {messages.map((message) => {
          if (!message.id) {
            console.warn('Message missing ID:', message);
            return null;
          }
          
          return <MessageBubble key={message.id} message={message} />;
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}