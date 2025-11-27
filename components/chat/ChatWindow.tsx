// components/chat/ChatWindow.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessage, LLMContent } from '@/lib/types';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { useChat } from '@/context/ChatContext';
import { DEFAULT_USER_ID } from '@/lib/constants';


interface ChatWindowProps {
  chatId: string;
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
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
  onContentClick,
  isClickable = false,
}: ChatWindowProps) {
  const { conversations } = useChat(); // ✅ Add this here


  const isEmpty = messages.length === 0;
  const currentConversation = conversations.find(c => c.id === chatId);

  type DocumentStatus = {
    id: number;
    status: string;
    title?: string | null;
    updatedAt?: string | null;
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentStatus[]>([]);

  const statusTone = useCallback((status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/15 text-emerald-500';
      case 'processing':
        return 'bg-blue-500/15 text-blue-500';
      case 'failed':
        return 'bg-red-500/15 text-red-500';
      default:
        return 'bg-amber-500/15 text-amber-500';
    }
  }, []);

  const handleAttachFile = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const refreshDocuments = useCallback(async () => {
    try {
      const response = await fetch(`/api/documents?user_id=${encodeURIComponent(DEFAULT_USER_ID)}`, { cache: 'no-store' });
      const data = await response.json();
      if (Array.isArray(data.documents)) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents', error);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const base =
      process.env.NEXT_PUBLIC_WS_URL ||
      `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8000/ws/agents`;
    const socket = new WebSocket(base);
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data ?? '{}');
        if (data?.type === 'document.ingestion') {
          const payload = data.payload || {};
          setDocuments((prev) => {
            const title = payload.metadata?.title || `Document ${payload.document_id}`;
            const updated = prev.filter((doc) => doc.id !== payload.document_id);
            return [
              { id: payload.document_id, status: payload.status, title, updatedAt: new Date().toISOString() },
              ...updated,
            ];
          });
        }
      } catch (err) {
        console.warn('Failed to parse websocket event', err);
      }
    };
    socket.onerror = (err) => console.error('WebSocket error', err);
    return () => socket.close();
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadMessage(`Uploading "${file.name}"...`);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', DEFAULT_USER_ID);
      formData.append('title', file.name);

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.detail || 'Upload failed');
      }

      setUploadMessage(`Document "${file.name}" uploaded. Ingestion has started.`);
    } catch (error) {
      console.error('Document upload failed:', error);
      setUploadMessage(
        error instanceof Error ? `Upload failed: ${error.message}` : 'Upload failed'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden card-agilitas">
      {/* Athletic header bar */}
      <div className="flex items-center justify-between h-16 border-b-4 border-primary/30 px-6 bg-gradient-to-r from-secondary to-secondary/80 relative overflow-hidden">
        {/* Speed lines decoration */}
        <div className="absolute inset-0 speed-lines opacity-20" />
        
        {currentConversation && (
          <h2 className="text-base font-bold uppercase tracking-wider truncate max-w-[80%] text-white relative z-10">
            {currentConversation.title === 'New Chat' ? (
              <span className="flex items-center gap-2">
                <span>New Performance Analysis</span>
                <span className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <span
                      key={`loading-${i}`}
                      className="w-2 h-2 rounded-full bg-accent"
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
        
        {/* Performance indicator */}
        <div className="w-24 h-2 bg-secondary/50 rounded-full overflow-hidden relative z-10">
          <div className="performance-meter" />
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".pdf,.txt,.csv,.doc,.docx"
      />

      {uploadMessage && (
        <div className="px-4 py-2 text-xs text-muted-foreground bg-secondary/10">
          {isUploading ? (
            <span className="flex items-center gap-2">
              <span className="agilitas-loader w-4 h-4" />
              {uploadMessage}
            </span>
          ) : (
            uploadMessage
          )}
        </div>
      )}

      {documents.length > 0 && (
        <div className="px-4 py-3 bg-secondary/5 border-b border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Document Ingestion
            </h4>
            <button
              className="text-[10px] uppercase tracking-wide text-primary hover:underline"
              onClick={refreshDocuments}
            >
              Refresh
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {documents.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-card border border-primary/10 text-xs"
              >
                <span className="font-semibold truncate max-w-[120px]">
                  {doc.title || `Document ${doc.id}`}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusTone(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HERE IS THE MAIN CHANGE: We use conditional rendering to show
        two completely different layouts based on whether the chat is empty.
      */}
      {isEmpty ? (
        // ===================================================================
        // LAYOUT 1: WHEN CHAT IS EMPTY - Center everything as one block
        // ===================================================================
        <div className="flex-1 flex flex-col justify-center items-center p-4 relative">
         {/* Background decoration */}
         <div className="absolute inset-0 flex items-center justify-center opacity-5">
           <div className="text-[20rem] font-black text-primary select-none">A</div>
         </div>
         
         <div className="text-center max-w-xl mx-auto mb-8 relative z-10">
           <h1 className="text-6xl font-black mb-4 brand-title">
             <span className="text-gradient">AGILITAS</span>
           </h1>
           <h2 className="text-3xl font-bold mb-2 text-speed uppercase">CFO Assistant</h2>
           <div className="performance-meter w-48 h-3 mx-auto mb-6"></div>
           <p className="text-lg text-muted-foreground font-medium">
             Accelerate your financial performance analysis
           </p>
         </div>

            {/* ChatInput is rendered directly below the message */}
            <ChatInput
              isCentered={true} // Use the centered variant of the input
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendMessage={onSendMessage}
              isLoading={isLoading}
              onAttachFile={handleAttachFile}
              isUploading={isUploading}
            />
        </div>
      ) : (
        // ===================================================================
        // LAYOUT 2: WHEN CHAT HAS MESSAGES - The standard chat view
        // ===================================================================
        <>
          {/* Main content area for scrolling messages */}
          <div className="flex-1 overflow-auto p-4" style={{maxHeight: 'calc(100vh - 200px)', overflowY: 'auto'}}>
            <ChatMessages 
              messages={messages} 
              messagesEndRef={messagesEndRef} 
              onContentClick={onContentClick}
              isClickable={isClickable}
            />
            {isLoading && (
              <div className="px-4 py-2 flex gap-2 items-center">
                <div className="agilitas-loader w-8 h-8" />
                <span className="text-sm font-bold uppercase tracking-wider text-primary animate-pulse">
                  Analyzing Performance Data...
                </span>
              </div>
            )}
          </div>

          {/* Input area fixed at the bottom */}
          <div className="p-4 bg-gradient-to-r from-secondary/10 via-transparent to-primary/10 border-t-4 border-primary/30 relative">
            {/* Speed effect */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
            <ChatInput
              isCentered={false} // Use the standard, non-centered input
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              onSendMessage={onSendMessage}
              isLoading={isLoading}
              onAttachFile={handleAttachFile}
              isUploading={isUploading}
            />
          </div>
        </>
      )}
    </div>
  );
}

