// app/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatMessage, LLMContent, Conversation, ChartContent, isTextContent } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/context/ChatContext';
import { MarkdownRenderer } from '@/components/common/MarkDownRenderer';
import { ImageDisplay } from '@/components/common/ImageDisplay';
import { ChartDisplay } from '@/components/common/ChartDisplay';

export default function HomePage() {
  const {
    activeChatId,
    conversations,
    startNewChat
  } = useChat();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [largeContentData, setLargeContentData] = useState<LLMContent | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when chat changes
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const currentChat = conversations.find(c => c.id === activeChatId);
        setMessages(currentChat?.messages || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeChatId) {
      loadMessages();
    } else {
      setMessages([]);
    }
    setLargeContentData(null);
  }, [activeChatId, conversations]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const isChartContent = (content: any): content is ChartContent => {
    return (
      content?.type === 'chart' &&
      typeof content.chartType === 'string' &&
      content.data &&
      Array.isArray(content.data.labels) &&
      Array.isArray(content.data.datasets)
    );
  };

  // Helper function to extract text content from message
  const getMessageTextContent = (message: ChatMessage): string => {
    const textContent = message.content.find(isTextContent);
    return textContent?.content || '';
  };

  const handleSendMessage = async () => {
  if (!inputMessage.trim() || isLoading) return;

  const userMessage: ChatMessage = {
    id: uuidv4(),
    role: 'user',
    content: [{ type: 'text', content: inputMessage.trim() }],
    timestamp: new Date(),
  };

  // Create new chat if none exists
  if (!activeChatId) {
    startNewChat();
    return; // Wait for chat to be created
  }

  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsLoading(true);
  setLargeContentData(null);

  try {
    console.log('Sending request to /api/chat'); // Debug log
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content.find(c => c.type === 'text')?.content || ''
        })),
        chatId: activeChatId
      }),
    });

    console.log('Received response:', response.status); // Debug log

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty');
    }

    // ... rest of your streaming logic ...
  } catch (error) {
    console.error('Full error details:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    setMessages(prev => [...prev, {
      id: uuidv4(),
      role: 'assistant',
      content: [{ 
        type: 'text', 
        content: 'Failed to connect to the chat service. Please try again.' 
      }],
      timestamp: new Date(),
    }]);
  } finally {
    setIsLoading(false);
    scrollToBottom();
  }
};

  const handleCloseLargeContent = () => setLargeContentData(null);

  return (
    <div className={`flex flex-1 ${largeContentData ? 'md:grid md:grid-cols-2' : 'flex'} gap-4 p-4 h-full`}>
      <div className={`flex-1 flex flex-col min-h-full ${largeContentData ? 'md:border-r md:pr-4' : ''}`}>
        <ChatWindow
          chatId={activeChatId || ''}
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {largeContentData && (
        <ScrollArea className="hidden md:block w-full md:w-1/2 p-4 border-l rounded-lg bg-card shadow-sm">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleCloseLargeContent}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            {largeContentData.type === 'image' && (
              <ImageDisplay imageData={largeContentData} />
            )}
            {isChartContent(largeContentData) && (
              <ChartDisplay chartData={largeContentData} />
            )}
            {largeContentData.type === 'code' && (
              <MarkdownRenderer 
                content={`\`\`\`${largeContentData.language}\n${largeContentData.content}\n\`\`\``} 
              />
            )}
            {largeContentData.type === 'text' && (
              <MarkdownRenderer content={largeContentData.content} />
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}