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

  const [visibleConversations, setVisibleConversations] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('conversations');
      return saved ? JSON.parse(saved) : conversations.filter((c) => !c.archived);
    }
    return conversations.filter((c) => !c.archived);
  });

  useEffect(() => {
    const nonArchived = conversations.filter((c) => !c.archived);
    setVisibleConversations(nonArchived);
    localStorage.setItem('conversations', JSON.stringify(nonArchived));
  }, [conversations]);

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
        collapsed ? 'w-16 p-2' : 'w-64 p-4'
      )}
    >
      <div className="flex items-center justify-between h-14 mb-4">
        {!collapsed && <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col items-start gap-4 pb-4 mb-2">
        <Button
          onClick={startNewChat}
          className="w-full justify-start mb-2 bg-white hover:bg-gray-100 text-black font-medium"
        >
          <MessageCirclePlus className="w-4 h-4 mr-2" /> New Chat
        </Button>

        <Button
          onClick={() => toast.info('Search clicked!')}
          className="w-full justify-start gap-2 bg-white hover:bg-gray-100 text-black font-medium"
        >
          <Search className="w-4 h-4" /> Search Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 pr-1.5">
        <nav className="grid gap-2">
          {visibleConversations.map((conv: { id: string; title: string; archived?: boolean }) => (

            <div
              key={conv.id}
              className={cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                'hover:bg-gray-100',
                activeChatId === conv.id
                  ? 'bg-gray-200 text-black font-semibold'
                  : 'text-gray-600'
              )}
            >
              <div
                onClick={() => setActiveChatId(conv.id)}
                className="flex items-center gap-2 cursor-pointer flex-grow overflow-hidden"
              >
                <MessageSquareText className="h-4 w-4 shrink-0" />
                {!collapsed && editingChatId === conv.id ? (
                  <input
                    autoFocus
                    className="truncate w-full text-left bg-transparent focus:outline-none"
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    onBlur={() => {
                      if (editInput.trim()) {
                        handleRenameInline(conv.id, editInput);
                      }
                      setEditingChatId(null);
                    }}

                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameInline(conv.id, editInput);
                        setEditingChatId(null);
                      }
                    }} />
                ) : (
                  <button
                    className="truncate text-left w-full"
                    onDoubleClick={() => {
                      setEditingChatId(conv.id);
                      setEditInput(conv.title);
                    }}
                  >
                    {conv.title}
                  </button>
                )}
              </div>

              {!collapsed && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-2">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuPortal>
                     <DropdownMenuContent
                      align="end"
                      side="bottom"
                      className="bg-white border border-gray-200 shadow-lg z-50"
                      sideOffset={4}
                    >
                      <DropdownMenuItem onClick={() => handleShare(conv.id)}>
                        <Share className="w-4 h-4 mr-2" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchive(conv.id)}>
                        <Archive className="w-4 h-4 mr-2" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingChatId(conv.id);
                          setEditInput(conv.title);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" /> Rename
                      </DropdownMenuItem>

                        <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(conv.id, conv.title);
                        }}
                        className="text-red-600 hover:!text-red-700 focus:!text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2 text-red-600" /> Delete
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu>
              )}
            </div>
          ))}

        </nav>
      </ScrollArea>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will permanently delete the chat titled "{currentAction?.chatTitle}".
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
  );
}
