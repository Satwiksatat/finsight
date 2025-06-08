// context/ChatContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'; // Import useEffect
import { Conversation } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextType {
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  conversations: Conversation[];
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  startNewChat: () => void;
    renameConversation: (id: string, newTitle: string) => void;
  deleteConversation: (id: string) => void;
  archiveConversation: (id: string) => void; // Optional: depends on implementation

}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  // Initialize to empty array on server (and first client render)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false); // New state to track if on client

  // Load conversations from localStorage ONLY on the client after mount
  useEffect(() => {
    setIsClient(true); // Mark that we are on the client
    const storedConversations = localStorage.getItem('chatConversations');
    if (storedConversations) {
      setConversations(JSON.parse(storedConversations));
    }
  }, []); // Run once on client mount

  // Save conversations to localStorage whenever they change, but only on client
  useEffect(() => {
    if (isClient) { // Only save if we are on the client
      localStorage.setItem('chatConversations', JSON.stringify(conversations));
    }
  }, [conversations, isClient]); // Depend on conversations and isClient

  const addConversation = (conversation: Conversation) => {
    setConversations((prev) => [...prev, conversation]);
  };

  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, ...updates } : conv))
    );
  };
  const renameConversation = (id: string, newTitle: string) => {
  updateConversation(id, { title: newTitle });
};

const deleteConversation = (id: string) => {
  setConversations((prev) => {
    const filtered = prev.filter((conv) => conv.id !== id);

    // If the active conversation is deleted, reset the active ID
    if (activeChatId === id) {
      if (filtered.length > 0) {
        setActiveChatId(filtered[filtered.length - 1].id);
      } else {
        setActiveChatId(null);
      }
    }

    return filtered;
  });
};

const archiveConversation = (id: string) => {
  // Example: just update with an `archived: true` flag (you must extend Conversation type for this)
  updateConversation(id, { archived: true });
};


  const startNewChat = () => {
    const newId = uuidv4();
    const newConversation: Conversation = {
      id: newId,
      title: 'New Chat',
      lastMessageSnippet: '',
      timestamp: new Date(),
      messages: undefined
    };
    addConversation(newConversation);
    setActiveChatId(newId);
  };

  // Logic to set active chat, also needs to consider client-side only
  useEffect(() => {
    if (isClient) { // Ensure this only runs client-side after hydration
        if (!activeChatId && conversations.length === 0) {
            startNewChat();
        } else if (!activeChatId && conversations.length > 0) {
            setActiveChatId(conversations[conversations.length - 1].id);
        }
    }
  }, [activeChatId, conversations, isClient]);


  return (
    <ChatContext.Provider
      value={{
            activeChatId,
            setActiveChatId,
            conversations,
            addConversation,
            updateConversation,
            startNewChat,
            renameConversation,
            deleteConversation,
            archiveConversation
        }}

    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};