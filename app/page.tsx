// app/page.tsx
'use client'; // This component uses client-side hooks

import { useState, useEffect, useRef } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatMessage, LLMContent, ChartContent, ImageContent } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/context/ChatContext'; // To manage active chat
import { MarkdownRenderer } from '@/components/common/MarkDownRenderer';
import { ImageDisplay } from '@/components/common/ImageDisplay';
import { ChartDisplay } from '@/components/common/ChartDisplay';

export default function HomePage() {
  const { activeChatId } = useChat(); // Get active chat ID from context

  // Local state for the current chat's messages
  // In a real app, messages would be loaded from a database based on activeChatId
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [largeContentData, setLargeContentData] = useState<LLMContent | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Simulate loading messages for a new chat (replace with actual data fetching)
  useEffect(() => {
    // When activeChatId changes, load messages for that chat
    // For now, reset messages and largeContentData for simplicity
    setMessages([]);
    setLargeContentData(null);
    // In a real app: fetchMessages(activeChatId).then(setMessages);
  }, [activeChatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: [{ type: 'text', content: inputMessage.trim() }],
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setLargeContentData(null); // Clear large content when a new message is sent

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content[0] })) }), // Simple content for API
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader from response body.');
      }

      let decoder = new TextDecoder();
      let accumulatedContent = '';
      let botMessageId = uuidv4();
      let currentBotContent: LLMContent[] = [];

      // Add a placeholder bot message immediately
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: botMessageId,
          role: 'assistant',
          content: [{ type: 'text', content: '...' }], // Placeholder
          timestamp: new Date(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;

        // --- Parsing Logic for LLM Output ---
        // This is a simplified example. In a real application, you might
        // parse partial JSON objects if your LLM streams structured JSON,
        // or process Markdown chunks as they arrive.
        // For demonstration, we'll try to detect content types from the full accumulated string.

        // Attempt to parse as JSON first (for charts, images, or structured data)
        try {
          const parsedJson = JSON.parse(accumulatedContent);
          if (parsedJson.type) {
            // Found a structured object
            currentBotContent = [parsedJson as LLMContent]; // Assume it's a complete LLMContent object
            if (parsedJson.type === 'chart' || parsedJson.type === 'image' || (parsedJson.type === 'code' && parsedJson.content.length > 500)) {
                setLargeContentData(parsedJson as ChartContent | ImageContent);
            }
            // Once structured content is fully parsed, we can consider it complete.
            // In a real stream, you might need a more robust partial JSON parser.
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === botMessageId
                        ? { ...msg, content: currentBotContent, timestamp: new Date() }
                        : msg
                )
            );
            accumulatedContent = ''; // Clear for next potential structured output
            break; // Stop reading if a complete structured object was found
          }
        } catch (jsonError) {
          // Not a complete JSON object yet, or it's plain text/markdown
          // Continue accumulating and treating as markdown for now
          currentBotContent = [{ type: 'text', content: accumulatedContent }];
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === botMessageId
                ? { ...msg, content: currentBotContent, timestamp: new Date() }
                : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add an error message bubble
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          id: uuidv4(),
          role: 'assistant',
          content: [{ type: 'text', content: `Error: Failed to get response. ${error instanceof Error ? error.message : String(error)}` }],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleCloseLargeContent = () => {
    setLargeContentData(null);
  };

  return (
    <div className={`flex flex-1 ${largeContentData ? 'md:grid md:grid-cols-2' : 'flex'} gap-4 p-4 h-full`}>
      {/* Main Chat Window */}
      <div className={`flex-1 flex flex-col min-h-full ${largeContentData ? 'md:border-r md:pr-4' : ''}`}>
        <ChatWindow
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Side Panel for Large Content */}
      {largeContentData && (
        <ScrollArea className="hidden md:block w-full md:w-1/2 p-4 border-l border-gray-200 dark:border-gray-700 rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="flex justify-end mb-2">
            <button
              onClick={handleCloseLargeContent}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close large content view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            {largeContentData.type === 'image' && <ImageDisplay imageData={largeContentData} />}
            {largeContentData.type === 'chart' && <ChartDisplay chartData={largeContentData} />}
            {largeContentData.type === 'code' && (
              <MarkdownRenderer content={`\`\`\`${largeContentData.language}\n${largeContentData.content}\n\`\`\``} />
            )}
            {/* If you want to show large text in the split view: */}
            {largeContentData.type === 'text' && (
              <MarkdownRenderer content={largeContentData.content} />
            )}
            {/* Add more types as needed */}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}