'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Conversation, ChatMessage } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextType {
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  conversations: Conversation[];
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  updateChatTitle: (id: string, newTitle: string) => void;
  startNewChat: () => string; // Now returns the new chat ID
  renameConversation: (id: string, newTitle: string) => void;
  deleteConversation: (id: string) => void;
  archiveConversation: (id: string) => void;
  isGeneratingTitle: boolean;
  generateTitleForChat: (chatId: string, messages: ChatMessage[]) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Load from localStorage
  useEffect(() => {
    setIsClient(true);
    const stored = localStorage.getItem('chatConversations');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Migrate old conversations
        const migrated = parsed.map((conv: any) => ({
          ...conv,
          isTitleGenerated: conv.isTitleGenerated || false,
          createdAt: new Date(conv.createdAt),
          lastUpdated: conv.lastUpdated ? new Date(conv.lastUpdated) : new Date()
        }));
        setConversations(migrated);
      } catch (e) {
        console.error('Failed to parse stored conversations', e);
      }
    }
  }, []);

  // Persist to localStorage
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
      isTitleGenerated: false // Mark as user-edited
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
    const res = await fetch('/api/chat/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (res.ok) {
      const { title } = await res.json();
      if (title) {
        updateChatTitle(chatId, title);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Title generation failed:', error);
    return false;
  } finally {
    setIsGeneratingTitle(false);
  }
}, [isGeneratingTitle, updateChatTitle]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const filtered = prev.filter(conv => conv.id !== id);
      if (activeChatId === id) {
        setActiveChatId(filtered.length ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [activeChatId]);

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

  // Auto-select or create at first load
  useEffect(() => {
    if (!isClient || activeChatId !== null) return;
    
    if (conversations.length === 0) {
      startNewChat();
    } else {
      // Select most recently updated conversation
      const mostRecent = [...conversations].sort(
        (a, b) => (b.lastUpdated?.getTime() || 0) - (a.lastUpdated?.getTime() || 0)
      )[0];
      setActiveChatId(mostRecent.id);
    }
  }, [isClient, activeChatId, conversations, startNewChat]);

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
        renameConversation: renameConversation,
        deleteConversation,
        archiveConversation,
        isGeneratingTitle,
        generateTitleForChat,
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