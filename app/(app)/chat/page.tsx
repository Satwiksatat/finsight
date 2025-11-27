'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatMessage, LLMContent, ChartContent, TextContent, isTextContent, isChartContent } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useChat } from '@/context/ChatContext';
import { MarkdownRenderer } from '@/components/common/MarkDownRenderer';
import { ImageDisplay } from '@/components/common/ImageDisplay';
import { ChartDisplay } from '@/components/common/ChartDisplay';
import { ResizableSplitScreen } from '@/components/common/ResizableSplitScreen';
import { extractChartFromText, parseLLMChartResponse } from '@/lib/chartParser';
import { DEFAULT_USER_ID } from '@/lib/constants';

export default function HomePage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const {
    activeChatId,
    conversations,
    startNewChat,
    updateConversation,
    generateTitleForChat,
  } = useChat();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [largeContentData, setLargeContentData] = useState<LLMContent | null>(null);
  const [storedChartData, setStoredChartData] = useState<LLMContent | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const titleGenerationRef = useRef<Set<string>>(new Set());
  const isStreamingRef = useRef(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!activeChatId || isStreamingRef.current) return;

    const currentChat = conversations.find((conversation) => conversation.id === activeChatId);

    if (currentChat) {
      setMessages(currentChat.messages || []);
    } else {
      setMessages([]);
    }
    setLargeContentData(null);
    setStoredChartData(null);

    // Clear title generation tracking for new conversations
    if (currentChat && currentChat.isTitleGenerated) {
      titleGenerationRef.current.add(activeChatId);
    }
  }, [activeChatId, conversations]);

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      setLargeContentData(null);
      setStoredChartData(null);
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

  // Use the isChartContent from types.ts - removed local duplicate

  // Check if text content contains a chart response
  const checkForChartInText = (text: string): ChartContent | null => {
    const chartResponse = extractChartFromText(text);
    if (chartResponse) {
      return parseLLMChartResponse(chartResponse);
    }
    return null;
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
    setStoredChartData(null);
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
          chatId: chatId,
          user_id: DEFAULT_USER_ID
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
      let hasStructuredChart = false; // Track if we've received structured chart content

      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        isStreaming: true,
        metadata: {},
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

          console.log('Processing SSE data:', data);
          
          // Handle structured data
          if (data.event === 'structured_content') {
            if (data.type === 'structured_content') {
              console.log('Found structured content!');
              const llmContent = data.content;
              if (llmContent.type === 'chart' || llmContent.viz_choice === 'chart') {
                // Parse the chart data using the chartParser
                console.log('Raw chart data from backend:', llmContent);
                const chartContent = parseLLMChartResponse(llmContent);
                console.log('Parsed chart content:', chartContent);
                console.log('Setting largeContentData...');
                setLargeContentData(chartContent);
                setStoredChartData(chartContent);
                hasStructuredChart = true; // Mark that we have structured chart content
                assistantContent = [...assistantContent, { type: 'text', content: '[Chart displayed in split screen]' }];
              } else if (llmContent.type === 'image') {
                setLargeContentData(llmContent);
                assistantContent = [...assistantContent, { type: 'text', content: '[Image displayed in split screen]' }];
              } else if (llmContent.type === 'code') {
                setLargeContentData(llmContent);
                assistantContent = [...assistantContent, { type: 'text', content: '[Code displayed in split screen]' }];
              }
            } else if (data.type === 'citations') {
              const citations = Array.isArray(data.content) ? data.content : [];
              if (citations.length) {
                type Citation = {
                  title?: string;
                  url?: string;
                  source?: string;
                };

                const formatted = citations
                  .map((item: Citation, idx: number) => {
                    const title = item.title || item.url || `Source ${idx + 1}`;
                    const source = item.source ? ` (${item.source})` : '';
                    return `${idx + 1}. ${title}${source}${item.url ? ` — ${item.url}` : ''}`;
                  })
                  .join('\n');
                assistantContent = [
                  ...assistantContent,
                  { type: 'text', content: `Sources:\n${formatted}` },
                ];
              }
            }
          } else if (data.event === 'text_chunk' && data.text) {
            assistantContent = assistantContent.map(block =>
              block.type === 'text' ? { ...block, content: block.content + data.text } : block
            );
            
            // Only check for charts in text if we haven't received structured chart content
            if (!hasStructuredChart) {
              const currentText = assistantContent.find(block => block.type === 'text')?.content || '';
              const chartContent = checkForChartInText(currentText);
              if (chartContent) {
                setLargeContentData(chartContent);
                setStoredChartData(chartContent);
                // Replace the text content with a placeholder
                assistantContent = assistantContent.map(block =>
                  block.type === 'text' ? { ...block, content: '[Chart displayed in split screen]' } : block
                );
              }
            }
          } else if (data.event === 'message' && data.answer) {
            assistantContent = assistantContent.map(block =>
              block.type === 'text' ? { ...block, content: block.content + data.answer } : block
            );
            
            // Only check for charts in text if we haven't received structured chart content
            if (!hasStructuredChart) {
              const currentText = assistantContent.find(block => block.type === 'text')?.content || '';
              const chartContent = checkForChartInText(currentText);
              if (chartContent) {
                setLargeContentData(chartContent);
                setStoredChartData(chartContent);
                // Replace the text content with a placeholder
                assistantContent = assistantContent.map(block =>
                  block.type === 'text' ? { ...block, content: '[Chart displayed in split screen]' } : block
                );
              }
            }
          } else if (data.event === 'agent_message' && data.answer) {
            assistantContent = assistantContent.map(block =>
              block.type === 'text' ? { ...block, content: block.content + data.answer } : block
            );
            
            // Only check for charts in text if we haven't received structured chart content
            if (!hasStructuredChart) {
              const currentText = assistantContent.find(block => block.type === 'text')?.content || '';
              const chartContent = checkForChartInText(currentText);
              if (chartContent) {
                setLargeContentData(chartContent);
                setStoredChartData(chartContent);
                // Replace the text content with a placeholder
                assistantContent = assistantContent.map(block =>
                  block.type === 'text' ? { ...block, content: '[Chart displayed in split screen]' } : block
                );
              }
            }
          } else if (data.event === 'telemetry' && data.telemetry) {
            const skill = data.telemetry.selected_agent || data.telemetry.skill;
            setMessages(prev => prev.map(m => (
              m.id === assistantId
                ? { ...m, metadata: { ...(m.metadata || {}), telemetry: data.telemetry, skill } }
                : m
            )));
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

  const handleContentClick = (content: LLMContent) => {
    if (content.type === 'chart' || content.type === 'image' || content.type === 'code') {
      setLargeContentData(content);
    } else if (content.type === 'text' && (content as TextContent).content === '[Chart displayed in split screen]') {
      // Handle chart message click
      if (storedChartData) {
        setLargeContentData(storedChartData);
      }
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex flex-1 p-4 h-full justify-center items-center bg-background">
        <div className="text-center">
          <div className="agilitas-loader w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-primary animate-pulse">
            Initializing Performance System
          </h2>
          <div className="performance-meter w-48 h-2 mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 p-4 h-full">
      
      <ResizableSplitScreen
        leftPanel={
          <ChatWindow
            chatId={activeChatId || ''}
            messages={messages}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            messagesEndRef={messagesEndRef}
            onContentClick={handleContentClick}
            isClickable={true}
          />
        }
        rightPanel={
          <div className="prose dark:prose-invert max-w-none">
            {largeContentData?.type === 'image' && <ImageDisplay imageData={largeContentData} />}
            {largeContentData && isChartContent(largeContentData) && (
              <>
                {console.log('Rendering ChartDisplay component')}
                <ChartDisplay chartData={largeContentData} />
              </>
            )}
            {largeContentData?.type === 'chart' && !isChartContent(largeContentData) && (
              <div className="text-red-500 p-4">
                Chart data validation failed. Data: {JSON.stringify(largeContentData, null, 2)}
              </div>
            )}
            {largeContentData?.type === 'code' && (
              <MarkdownRenderer content={`\`\`\`${largeContentData.language}\n${largeContentData.content}\n\`\`\``} />
            )}
            {largeContentData?.type === 'text' && (
              <MarkdownRenderer content={largeContentData.content} />
            )}
            {!largeContentData && (
              <div className="text-muted-foreground p-4">No content to display</div>
            )}
          </div>
        }
        isVisible={!!largeContentData}
        onClose={handleCloseLargeContent}
        minWidth={300}
        maxWidth={800}
        defaultWidth={500}
      />
    </div>
  );
}
