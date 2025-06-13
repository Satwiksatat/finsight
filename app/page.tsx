// app/page.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatMessage, LLMContent, Conversation, ChartContent } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/context/ChatContext';
import { MarkdownRenderer } from '@/components/common/MarkDownRenderer';
import { ImageDisplay } from '@/components/common/ImageDisplay';
import { ChartDisplay } from '@/components/common/ChartDisplay';
import { generateChatTitle } from '@/app/utils/ChatNaming';

export default function HomePage() {
  const { activeChatId } = useChat();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [largeContentData, setLargeContentData] = useState<LLMContent | null>(null);
  const [chats, setChats] = useState<Conversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatId = activeChatId || uuidv4();

  // Enhanced message loading effect
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        // Simulated fetch - replace with actual API call
        const fakeMessages: ChatMessage[] = [];
        setMessages(fakeMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (chatId) {
      loadMessages();
    } else {
      setMessages([]);
    }
    setLargeContentData(null);
  }, [chatId]);

  // Auto-generate chat title when first message is sent
  useEffect(() => {
    const generateTitle = async () => {
      if (messages.length === 1 && messages[0].role === 'user') {
        try {
          const title = await generateChatTitle(messages);
          updateChatTitle(chatId || uuidv4(), title);
        } catch (error) {
          console.error('Failed to generate title:', error);
        }
      }
    };

    generateTitle();
  }, [messages.length, chatId]);

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

  const updateChatTitle = useCallback((chatId: string, title: string) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      )
    );
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: [{ type: 'text', content: inputMessage.trim() }],
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setLargeContentData(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content[0]
          })),
          chatId: chatId 
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get reader');

      const decoder = new TextDecoder();
      let accumulatedContent = '';
      const botMessageId = uuidv4();
      let currentBotContent: LLMContent[] = [{ type: 'text', content: '' }];

      setMessages(prev => [...prev, {
        id: botMessageId,
        role: 'assistant',
        content: currentBotContent,
        timestamp: new Date(),
      }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // Try to parse complete JSON objects
        const jsonMatches = accumulatedContent.match(/\{[\s\S]*?\}(?=\{|$)/g);
        if (jsonMatches) {
          jsonMatches.forEach(match => {
            try {
              const parsed = JSON.parse(match);
              if (parsed.type) {
                currentBotContent = [parsed];
                if (['chart', 'image'].includes(parsed.type)) {
                  setLargeContentData(parsed);
                }
              }
            } catch (e) {
              // If JSON parsing fails, treat as text
              currentBotContent = [{ type: 'text', content: match }];
            }
          });
        } else {
          currentBotContent = [{ type: 'text', content: accumulatedContent }];
        }

        setMessages(prev => 
          prev.map(msg => 
            msg.id === botMessageId 
              ? { ...msg, content: currentBotContent } 
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: [{ 
          type: 'text', 
          content: 'Sorry, I encountered an error. Please try again.' 
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
          chatId={chatId || uuidv4()}
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
          updateChatTitle={updateChatTitle}
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
              <XIcon className="h-6 w-6" />
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

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}