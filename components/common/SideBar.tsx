'use client';

import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';

import {
  MoreVertical,
  Share,
  Archive,
  Pencil,
  Trash2,
  MessageCirclePlus,
  MessageSquareText,
  Search,
} from 'lucide-react';

import { Tooltip } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRef } from 'react'
type Conversation = {
  id: string;
  title: string;
  archived?: boolean;
};


export function Sidebar() {
  const {
    conversations,
    activeChatId,
    setActiveChatId,
    startNewChat,
    renameConversation,
    deleteConversation,
    archiveConversation,
  } = useChat();

  const [collapsed, setCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'delete';
    chatId: string;
    chatTitle: string;
  } | null>(null);

  const [visibleConversations, setVisibleConversations] = useState<Conversation[]>(() => {

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('conversations');
      return saved ? JSON.parse(saved) : conversations.filter((c) => !c.archived);
    }
    return conversations.filter((c) => !c.archived);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingChatId]);



  useEffect(() => {
  const normalize = (text: string) => text.toLowerCase().trim();

  const filtered = conversations.filter(
    (c) =>
      !c.archived &&
      normalize(c.title).includes(normalize(searchQuery))
  );

  setVisibleConversations(filtered);
}, [searchQuery, conversations]);



  function handleShare(id: string) {
    navigator.clipboard.writeText(`${window.location.origin}/chat/${id}`);
    toast.success('Chat link copied to clipboard!');
  }

  function handleRenameInline(id: string, newTitle: string) {
    if (newTitle.trim()) {
      renameConversation(id, newTitle.trim());
      toast.success('Conversation renamed.');
    }
  }

  function handleDeleteClick(id: string, title: string) {
    setCurrentAction({ type: 'delete', chatId: id, chatTitle: title });
    setDialogOpen(true);
  }

  function handleActionConfirm() {
    if (!currentAction) return;

    if (currentAction.type === 'delete') {
      deleteConversation(currentAction.chatId);
      toast.warning(`Conversation "${currentAction.chatTitle}" deleted.`);
    }

    setDialogOpen(false);
    setCurrentAction(null);
  }

  function handleArchive(id: string) {
    archiveConversation(id);
    toast(`Conversation archived.`);
  }

  return (
  <div
    className={cn(
      'flex flex-col h-screen border-r border-gray-200 bg-gray-50 transition-all duration-300 ease-in-out shrink-0',
      collapsed ? 'w-14 p-2' : 'w-64 p-4'
    )}
  >
    {/* Header */}
    <div className="flex items-center justify-between h-14 mb-4">
      {!collapsed && <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />}
      <Tooltip content={collapsed ? 'Open Sidebar' : 'Close Sidebar'}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </Button>
      </Tooltip>
    </div>

    {/* New Chat + Search */}
    {!collapsed && (
      <div className="flex flex-col items-start gap-4 pb-4 mb-2">
        <Button
          onClick={startNewChat}
          className="w-full justify-start mb-2 bg-white hover:bg-gray-100 text-black font-medium"
        >
          <MessageCirclePlus className="w-4 h-4 mr-2" /> New Chat
        </Button>
        <input
          type="text"
          placeholder="Search Chat"
          className="w-full p-2 rounded-md bg-white border text-sm placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    )}

    {/* Chat List */}
    {!collapsed && (
  <ScrollArea className="flex-1 overflow-y-auto">
    <div className="flex flex-col gap-2 pr-2">
      {visibleConversations.map((chat: Conversation) => (
        <div
          key={chat.id}
          className={cn(
            'flex items-center justify-between px-3 py-2 rounded-md bg-white hover:bg-gray-100 text-sm text-black cursor-pointer',
            activeChatId === chat.id && 'bg-gray-200'
          )}
          onClick={() => setActiveChatId(chat.id)}
        >
          {editingChatId === chat.id ? (
            <input
              ref={inputRef}
              value={editInput}
              onChange={(e) => setEditInput(e.target.value)}
              onBlur={() => {
                handleRenameInline(chat.id, editInput);
                setEditingChatId(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRenameInline(chat.id, editInput);
                  setEditingChatId(null);
                }
              }}
              className="w-full bg-transparent outline-none"
            />
          ) : (
            <span className="truncate">{chat.title}</span>
          )}

          {/* dropdown menu for chat actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => {
                setEditingChatId(chat.id);
                setEditInput(chat.title);
              }}>
                <Pencil className="w-4 h-4 mr-2" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleShare(chat.id)}>
                <Share className="w-4 h-4 mr-2" /> Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleArchive(chat.id)}>
                <Archive className="w-4 h-4 mr-2" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDeleteClick(chat.id, chat.title)}>
                <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  </ScrollArea>
)}


    {/* Confirmation Dialog */}
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete "
        <strong>{currentAction?.chatTitle}</strong>"?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setDialogOpen(false)}>
        Cancel
      </Button>
      <Button variant="destructive" onClick={handleActionConfirm}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

  </div>
)  }
