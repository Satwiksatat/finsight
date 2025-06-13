// components/chat/ChatWindow.tsx
import React, { useEffect } from 'react';
import { ChatMessage, LLMContent } from '@/lib/types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { cn } from '@/lib/utils';
import { generateChatTitle } from "@/app/utils/ChatNaming";


interface ChatWindowProps {
  chatId: string;
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  updateChatTitle: (chatId: string, title: string) => void;
}

export function ChatWindow({
  chatId,
  messages,
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  messagesEndRef,
  updateChatTitle}: ChatWindowProps) {
  const isEmpty = messages.length === 0;

  useEffect(() => {
    // Auto-generate title after first user message
    if (messages.length === 1 && messages[0].role === "user") {
      generateChatTitle(messages).then(title => {
        updateChatTitle(chatId, title);
      });
    }
    // Update title when conversation evolves
    else if (messages.length > 1 && messages.length % 3 === 0) {
      generateChatTitle(messages).then(title => {
        updateChatTitle(chatId, title);
      });
    }
  }, [messages, chatId, updateChatTitle]);

    
  const handleAttachFile = () => {
    // Implement file attachment logic
    console.log('Attach file');
  };

  const handleAttachImage = () => {
    // Implement image attachment logic
    console.log('Attach image');
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden">
      <div className="flex items-center justify-between h-14 border-b border-border px-4">
        {/* <h3 className="font-semibold text-lg">Active Chat</h3> */}
      </div>
      
      {/* Main content area */}
      <div className={cn(
        "flex-1 overflow-auto p-4",
        isEmpty ? "flex items-center justify-center" : ""
      )}>
        {!isEmpty ? (
          <>
            <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
            {isLoading && (
              <div className="px-4 py-2 flex gap-1 items-center">
                <span className="text-sm text-muted-foreground animate-pulse">Answering...</span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-300"></span>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Input area */}
      <div className={cn(
        "p-4 bg-card border-t border-border",
        "border-t-0"
      )}>
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          onAttachFile={handleAttachFile}
          onAttachImage={handleAttachImage}
          isCentered={isEmpty} // Center only when empty
        />
      </div>
    </div>
  );
}