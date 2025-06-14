'use client';

import React, { useEffect, useState } from 'react';
import { ChatMessage } from '@/lib/types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { cn } from '@/lib/utils';
import { useChat } from '@/context/ChatContext';

interface ChatWindowProps {
  chatId: string;
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatWindow({
  chatId,
  messages,
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  messagesEndRef,
}: ChatWindowProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { updateChatTitle, generateTitleForChat, conversations } = useChat();
  const isEmpty = messages.length === 0;
  const currentConversation = conversations.find(c => c.id === chatId);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* -------- Title Generation Logic -------- */
  useEffect(() => {
    if (!isMounted || !chatId || !messages.length || !currentConversation) return;

    const shouldGenerate = 
      (messages.length === 1 && messages[0].role === 'user' && !currentConversation.isTitleGenerated) ||
      (messages.length > 1 && currentConversation.title === 'New Chat');

    if (shouldGenerate) {
      const timer = setTimeout(() => {
        generateTitleForChat(chatId, messages);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isMounted, messages, chatId, generateTitleForChat, currentConversation]);

  const handleAttachFile = () => console.log('Attach file');
  const handleAttachImage = () => console.log('Attach image');

  const handleConversationClick = (chatId: string) => {
    if (!isMounted) return;
    setActiveChatId(chatId);
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden">
        {/* Skeleton loader that matches your layout */}
        <div className="h-14 border-b border-border" />
        <div className={cn(
          'flex-1 overflow-auto p-4',
          isEmpty ? 'flex items-center justify-center' : ''
        )}>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-card border-t border-border">
          <div className="animate-pulse h-10 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden">
      <div className="flex items-center justify-between h-14 border-b border-border px-4">
        {currentConversation && (
          <h2 className="text-sm font-medium truncate max-w-[80%]">
            {currentConversation.title === 'New Chat' ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <span>New Chat</span>
                <span className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <span 
                      key={`loading-${i}`}
                      className="w-1.5 h-1.5 rounded-full bg-muted-foreground opacity-60"
                      style={{ animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }}
                    />
                  ))}
                </span>
              </span>
            ) : (
              currentConversation.title
            )}
          </h2>
        )}
      </div>

      <div className={cn(
        'flex-1 overflow-auto p-4',
        isEmpty ? 'flex items-center justify-center' : ''
      )}>
        {!isEmpty ? (
          <>
            <ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
            {isLoading && (
              <div className="px-4 py-2 flex gap-1 items-center">
                <span className="text-sm text-muted-foreground animate-pulse">
                  Answering…
                </span>
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-300" />
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            No messages yet. Start a conversation!
          </div>
        )}
      </div>

      <div className="p-4 bg-card border-t border-border border-t-0">
        <ChatInput
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          onAttachFile={handleAttachFile}
          onAttachImage={handleAttachImage}
          isCentered={isEmpty}
        />
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function setActiveChatId(chatId: string) {
  throw new Error('Function not implemented.');
}
