'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { Conversation, ChatMessage } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextType {
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  conversations: Conversation[];
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  updateChatTitle: (id: string, newTitle: string) => void;
  startNewChat: () => string;
  renameConversation: (id: string, newTitle: string) => void;
  deleteConversation: (id: string) => void;
  archiveConversation: (id: string) => void;
  isGeneratingTitle: boolean;
  generateTitleForChat: (chatId: string, messages: ChatMessage[]) => Promise<boolean>;
  getConversation: (id: string) => Conversation | undefined;
  clearAllLocalStorage: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const pendingActiveChatId = useRef<string | null>(null);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('activeChatId', activeChatId);
    } else {
      localStorage.removeItem('activeChatId');
    }
  }, [activeChatId]);

  // Handle pending active chat ID updates
  useEffect(() => {
    if (pendingActiveChatId.current !== null) {
      setActiveChatId(pendingActiveChatId.current);
      pendingActiveChatId.current = null;
    }
  }, [conversations]);

  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('chatConversations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // Filter out any conversations with invalid data
        const validConversations = parsed.filter((conv: any) => {
          if (!conv.id || !conv.title) {
            console.warn('Found invalid conversation:', conv);
            return false;
          }
          return true;
        });
        
        const migrated = validConversations.map((conv: any) => ({
          ...conv,
          isTitleGenerated: conv.isTitleGenerated || false,
          createdAt: new Date(conv.createdAt),
          lastUpdated: conv.lastUpdated ? new Date(conv.lastUpdated) : new Date(),
          messages: conv.messages || []
        }));
        setConversations(migrated);
      } catch (e) {
        console.error('Failed to parse stored conversations', e);
        // Clear corrupted data
        localStorage.removeItem('chatConversations');
        setConversations([]);
      }
    }
  }, []);

  // Load active chat ID after conversations are loaded
  useEffect(() => {
    if (isClient && activeChatId === null && conversations.length > 0) {
      const storedActiveId = localStorage.getItem('activeChatId');
      if (storedActiveId && conversations.find(c => c.id === storedActiveId)) {
        setActiveChatId(storedActiveId);
      }
    }
  }, [isClient, activeChatId, conversations]);

  // Update localStorage when conversations change
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('chatConversations', JSON.stringify(conversations));
    }
  }, [conversations, isClient]);

  const addConversation = useCallback((conversation: Conversation) => {
    setConversations(prev => [...prev, conversation]);
  }, []);

  const updateConversation = useCallback((id: string, updates: Partial<Conversation>) => {
    setConversations(prev =>
      prev.map(conv => 
        conv.id === id ? { 
          ...conv, 
          ...updates,
          lastUpdated: new Date() 
        } : conv
      )
    );
  }, []);

  const renameConversation = useCallback((id: string, newTitle: string) => {
    updateConversation(id, { 
      title: newTitle,
      isTitleGenerated: false 
    });
  }, [updateConversation]);

  const updateChatTitle = useCallback((id: string, newTitle: string) => {
    updateConversation(id, { 
      title: newTitle,
      isTitleGenerated: true 
    });
  }, [updateConversation]);

  const generateTitleForChat = useCallback(async (chatId: string, messages: ChatMessage[]) => {
    if (!messages.length || isGeneratingTitle) return false;

    setIsGeneratingTitle(true);
    try {
      // Format messages for title generation API
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content.find(c => c.type === 'text')?.content || ''
      }));

      const res = await fetch('/api/chat/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      const responseData = await res.json();

      if (res.ok && responseData.title && !responseData.error) {
        // Only update title if we have a valid title and no error
        updateChatTitle(chatId, responseData.title);
        return true;
      } else {
        console.error('Title generation failed:', responseData.error || 'Unknown error');
        return false;
      }
    } catch (error) {
      console.error('Title generation failed:', error);
      return false;
    } finally {
      setIsGeneratingTitle(false);
    }
  }, [isGeneratingTitle, updateChatTitle]);

  const getConversation = useCallback((id: string) => {
    return conversations.find(conv => conv.id === id);
  }, [conversations]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prevConversations => {
      const filtered = prevConversations.filter(conv => conv.id !== id);
      
      // Update active chat ID if the deleted conversation was active
      if (activeChatId === id) {
        const newActiveId = filtered[0]?.id ?? null;
        pendingActiveChatId.current = newActiveId;
      }
      
      return filtered;
    });
  }, [activeChatId]);

  // Clean up localStorage when conversations change
  useEffect(() => {
    if (isClient && conversations.length > 0) {
      // This will automatically update localStorage through the existing useEffect
      console.log('Conversations updated, localStorage will be updated automatically');
    }
  }, [conversations, isClient]);

  const archiveConversation = useCallback((id: string) => {
    updateConversation(id, { archived: true });
  }, [updateConversation]);

  const startNewChat = useCallback(() => {
    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      lastMessageSnippet: '',
      messages: [],
      createdAt: new Date(),
      archived: false,
      isTitleGenerated: false,
      lastUpdated: new Date()
    };
    addConversation(newConversation);
    setActiveChatId(newId);
    return newId;
  }, [addConversation]);

  const clearAllLocalStorage = useCallback(() => {
    localStorage.clear();
    setConversations([]);
    setActiveChatId(null);
    console.log('All localStorage data cleared.');
  }, []);


  return (
    <ChatContext.Provider
      value={{
        activeChatId,
        setActiveChatId,
        conversations,
        addConversation,
        updateConversation,
        updateChatTitle,
        startNewChat,
        renameConversation,
        deleteConversation,
        archiveConversation,
        isGeneratingTitle,
        generateTitleForChat,
        getConversation,
        clearAllLocalStorage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};