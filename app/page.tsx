'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatMessage, LLMContent, ChartContent, isTextContent } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat } from '@/context/ChatContext';
import { MarkdownRenderer } from '@/components/common/MarkDownRenderer';
import { ImageDisplay } from '@/components/common/ImageDisplay';
import { ChartDisplay } from '@/components/common/ChartDisplay';

export default function HomePage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const {
    activeChatId,
    conversations,
    startNewChat,
    updateConversation,
    updateChatTitle,
    generateTitleForChat,
    clearAllLocalStorage
  } = useChat();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [largeContentData, setLargeContentData] = useState<LLMContent | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const titleGenerationRef = useRef<Set<string>>(new Set());
  const isStreamingRef = useRef(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!activeChatId || isStreamingRef.current) return;

    const currentChat = conversations.find(c => c.id === activeChatId);
    
    if (currentChat) {
      setMessages(currentChat.messages || []);
    } else {
      setMessages([]);
    }
    setLargeContentData(null);
    
    // Clear title generation tracking for new conversations
    if (currentChat && currentChat.isTitleGenerated) {
      titleGenerationRef.current.add(activeChatId);
    }
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setLargeContentData(null);
      // Clear title generation tracking
      titleGenerationRef.current.clear();
    }
  }, [activeChatId]);

  // Handle title generation after messages are updated
  const handleTitleGeneration = useCallback(async () => {
    if (activeChatId && messages.length >= 2 && !isLoading) {
      const conversation = conversations.find(c => c.id === activeChatId);
      if (conversation && !conversation.isTitleGenerated && !titleGenerationRef.current.has(activeChatId)) {
        // Only generate title if we have both user and assistant messages
        const hasUserMessage = messages.some(m => m.role === 'user');
        const hasAssistantMessage = messages.some(m => m.role === 'assistant');
        
        if (hasUserMessage && hasAssistantMessage) {
          titleGenerationRef.current.add(activeChatId);
          await generateTitleForChat(activeChatId, messages);
        }
      }
    }
  }, [messages, activeChatId, conversations, isLoading, generateTitleForChat]);

  useEffect(() => {
    handleTitleGeneration();
  }, [handleTitleGeneration]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isChartContent = (content: any): content is ChartContent => {
    return (
      content?.type === 'chart' &&
      typeof content.chartType === 'string' &&
      content.data &&
      Array.isArray(content.data.labels) &&
      Array.isArray(content.data.datasets)
    );
  };

  const getMessageTextContent = (message: ChatMessage): string => {
    if (!message || !message.content) {
      console.warn('getMessageTextContent: message or message.content is undefined', message);
      return '';
    }
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

    let chatId = activeChatId;
    if (!chatId) {
      chatId = startNewChat();
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Update conversation after state update
    if (chatId) {
      setTimeout(() => {
        updateConversation(chatId, {
          messages: updatedMessages,
          lastMessageSnippet: getMessageTextContent(userMessage),
          lastMessageAt: new Date(),
        });
      }, 0);
    }

    setInputMessage('');
    setIsLoading(true);
    setLargeContentData(null);
    isStreamingRef.current = true;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content.find(c => c.type === 'text')?.content || ''
          })),
          chatId: chatId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not ok:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }
      
      if (!response.body) {
        console.error('Response body is empty');
        throw new Error('Response body is empty');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const assistantId = uuidv4();
      let assistantContent: LLMContent[] = [{ type: 'text', content: '' }];

      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        // Assuming Dify sends line-delimited JSON or SSE
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          // Handle both SSE format and plain text
          let data;
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.substring(6);
              data = JSON.parse(jsonStr);
            } catch (jsonError) {
              console.error('Failed to parse SSE JSON:', jsonError, 'Line:', line);
              continue;
            }
          } else {
            // Handle plain text chunks
            assistantContent = assistantContent.map(block =>
              block.type === 'text' ? { ...block, content: block.content + line } : block
            );
            setMessages(prev => {
              const updated = prev.map(m =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              );
              return updated;
            });
            continue;
          }

          // Handle structured data
          if (data.type === 'structured_content') {
            const llmContent = data.content;
            if (llmContent.type === 'chart') {
              setLargeContentData(llmContent);
              assistantContent = [...assistantContent, { type: 'text', content: '[Chart displayed in split screen]' }];
            } else if (llmContent.type === 'image') {
              setLargeContentData(llmContent);
              assistantContent = [...assistantContent, { type: 'text', content: '[Image displayed in split screen]' }];
            } else if (llmContent.type === 'code') {
              setLargeContentData(llmContent);
              assistantContent = [...assistantContent, { type: 'text', content: '[Code displayed in split screen]' }];
            }
          } else if (data.event === 'text_chunk' && data.text) {
            assistantContent = assistantContent.map(block =>
              block.type === 'text' ? { ...block, content: block.content + data.text } : block
            );
          } else if (data.event === 'message' && data.answer) {
            assistantContent = assistantContent.map(block =>
              block.type === 'text' ? { ...block, content: block.content + data.answer } : block
            );
          } else if (data.event === 'agent_message' && data.answer) {
            assistantContent = assistantContent.map(block =>
              block.type === 'text' ? { ...block, content: block.content + data.answer } : block
            );
          } else if (data.event === 'message_end') {
            // Don't add content for message_end, just log it
          }

          setMessages(prev => {
            const updated = prev.map(m =>
              m.id === assistantId ? { ...m, content: assistantContent } : m
            );
            return updated;
          });
        }
        scrollToBottom();
      }

      // Update conversation after streaming is complete
      if (chatId) {
        setMessages(prev => {
          const finalMessages = prev.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m);
          const last = finalMessages[finalMessages.length - 1];
          
          // Update conversation in the next tick to avoid render-time updates
          setTimeout(() => {
            updateConversation(chatId, {
              messages: finalMessages,
              lastMessageSnippet: getMessageTextContent(last),
              lastMessageAt: new Date(),
            });
          }, 0);
          
          return finalMessages;
        });
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: [{ type: 'text', content: 'Failed to connect to the chat service. Please try again.' }],
        timestamp: new Date(),
      };

      setMessages(prev => {
        const updated = [...prev, errorMsg];
        
        // Update conversation in the next tick to avoid render-time updates
        setTimeout(() => {
          updateConversation(chatId, {
            messages: updated,
            lastMessageSnippet: getMessageTextContent(errorMsg),
            lastMessageAt: new Date(),
          });
        }, 0);
        
        return updated;
      });
    } finally {
      setIsLoading(false);
      isStreamingRef.current = false;
      scrollToBottom();
    }
  };

  const handleCloseLargeContent = () => setLargeContentData(null);

  if (!isHydrated) {
    return (
      <div className="flex flex-1 p-4 h-full text-muted-foreground justify-center items-center">
        Loading...
      </div>
    );
  }

  // Temporary debug function
  const handleClearStorage = () => {
    clearAllLocalStorage();
    alert('All localStorage data cleared. Please refresh the page.');
  };

  return (
    <div className={`flex flex-1 ${largeContentData ? 'md:grid md:grid-cols-2' : 'flex'} gap-4 p-4 h-full`}>
      {/* Temporary debug button */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={handleClearStorage}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
          title="Clear all localStorage data"
        >
          Clear Storage
        </button>
      </div>
      
      <div className={`flex-1 flex flex-col min-h-full ${largeContentData ? 'md:border-r md:pr-4' : ''}`}>
        <ChatWindow
          chatId={activeChatId || ''}
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
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            {largeContentData.type === 'image' && <ImageDisplay imageData={largeContentData} />}
            {isChartContent(largeContentData) && <ChartDisplay chartData={largeContentData} />}
           {largeContentData.type === 'code' && (
  <MarkdownRenderer content={`\`\`\`${largeContentData.language}\n${largeContentData.content}\n\`\`\``} />
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
