// components/chat/ChatWindow.tsx
import React from 'react';
import { ChatMessage, LLMContent } from '@/lib/types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatWindowProps {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatWindow({
  messages,
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  messagesEndRef,
}: ChatWindowProps) {
  return (
    <div className="flex flex-col h-full bg-background rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between h-14 border-b px-4">
        <h3 className="font-semibold text-lg">Active Chat</h3>
        {isLoading && <span className="text-sm text-muted-foreground">Typing...</span>}
      </div>
      <ScrollArea className="flex-1 p-4">
        <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
      </ScrollArea>
      <div className="p-4 border-t bg-card">
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={onSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}