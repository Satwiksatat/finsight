// components/chat/ChatWindow.tsx
import React from 'react';
import { ChatMessage, LLMContent } from '@/lib/types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { useChat } from '@/context/ChatContext';


interface ChatWindowProps {
  chatId: string;
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  updateChatTitle: (id: string, title: string) => void;
  onContentClick?: (content: LLMContent) => void;
  isClickable?: boolean;
}


export function ChatWindow({
  chatId,
  messages,
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  messagesEndRef,
  updateChatTitle,
  onContentClick,
  isClickable = false,
}: ChatWindowProps) {
  const { conversations } = useChat(); // ✅ Add this here


  const isEmpty = messages.length === 0;
  const currentConversation = conversations.find(c => c.id === chatId);


  // Title generation is now handled in the main page component
  // This component focuses on display and user interaction

  const handleAttachFile = () => {
    // Implement file upload logic here
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden">
      {/* This top header bar remains unchanged */}
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

      {/* HERE IS THE MAIN CHANGE: We use conditional rendering to show
        two completely different layouts based on whether the chat is empty.
      */}
      {isEmpty ? (
        // ===================================================================
        // LAYOUT 1: WHEN CHAT IS EMPTY - Center everything as one block
        // ===================================================================
        <div className="flex-1 flex flex-col justify-center items-center p-4">
         <div className="text-center text-2xl font-semibold text-[color:hsl(var(--foreground))] max-w-xl mx-auto mb-5">
            
           <div className="text-center text-2xl font-semibold max-w-xl mx-auto mb-5">
             {/* Apply sidebar-background color only to "Hello CFO." */}
             <span className="text-[hsl(var(--sidebar-background))]">Hello CFO.</span><br />
               <span className="text-lg font-normal text-[color:hsl(var(--muted-foreground))]">

                 How can I assist with your financial strategy today?
               </span>
             </div>

            {/* ChatInput is rendered directly below the message */}
            <ChatInput
              isCentered={true} // Use the centered variant of the input
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendMessage={onSendMessage}
              isLoading={isLoading}
              onAttachFile={handleAttachFile}
            />
          </div>
        </div>
      ) : (
        // ===================================================================
        // LAYOUT 2: WHEN CHAT HAS MESSAGES - The standard chat view
        // ===================================================================
        <>
          {/* Main content area for scrolling messages */}
          <div className="flex-1 overflow-auto p-4">
            <ChatMessages 
              messages={messages} 
              messagesEndRef={messagesEndRef} 
              onContentClick={onContentClick}
              isClickable={isClickable}
            />
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
          </div>

          {/* Input area fixed at the bottom */}
          <div className="p-4 bg-card border-t border-border">
            <ChatInput
              isCentered={false} // Use the standard, non-centered input
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendMessage={onSendMessage}
              isLoading={isLoading}
              onAttachFile={handleAttachFile}
            />
          </div>
        </>
      )}
    </div>
  );
}

