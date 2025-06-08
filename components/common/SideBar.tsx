'use client';

import { useState } from 'react';
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

  const visibleConversations = conversations.filter((c) => !c.archived);
  const [collapsed, setCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'delete' | 'rename';
    chatId: string;
    chatTitle: string;
  } | null>(null);

  function handleShare(id: string) {
    console.log(`Share chat: ${id}`);
  }

  function handleRenameClick(id: string, currentTitle: string) {
    setCurrentAction({
      type: 'rename',
      chatId: id,
      chatTitle: currentTitle
    });
    setEditInput(currentTitle);
    setDialogOpen(true);
  }

  function handleDeleteClick(id: string, title: string) {
    setCurrentAction({
      type: 'delete',
      chatId: id,
      chatTitle: title
    });
    setDialogOpen(true);
  }

  function handleActionConfirm() {
    if (!currentAction) return;

    if (currentAction.type === 'delete') {
      deleteConversation(currentAction.chatId);
    } else if (currentAction.type === 'rename' && editInput.trim()) {
      renameConversation(currentAction.chatId, editInput.trim());
      setEditingChatId(null);
    }

    setDialogOpen(false);
    setCurrentAction(null);
  }

  function handleArchive(id: string) {
    archiveConversation(id);
  }

  return (
    <div
      className={cn(
        'flex flex-col h-screen border-r border-gray-200 bg-gray-50 p-4 shrink-0 transition-all',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between h-14 mb-4">
        {!collapsed && <img src="/logo.svg" alt="Logo" className="h-6 w-auto" />}
      </div>

      <div className="flex flex-col items-start gap-4 pb-4 border-b border-border">
        <Button
          onClick={startNewChat}
          className="w-full justify-start mb-2 bg-white hover:bg-gray-100 text-black font-medium"
        >
          <MessageCirclePlus className="w-4 h-4 mr-2" /> New Chat
        </Button>

        <Button
          onClick={() => alert('Search clicked!')}
          className="w-full justify-start gap-2 bg-white hover:bg-gray-100 text-black font-medium"
        >
          <Search className="w-4 h-4" /> Search Chat
        </Button>
      </div>

      <Separator className="my-4" />

      <ScrollArea className="flex-1 pr-1.5">
        <nav className="grid gap-2">
          {visibleConversations.map((conv) => (
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
                {!collapsed && (
                  <div className="flex flex-col overflow-hidden flex-grow">
                    {editingChatId === conv.id ? (
                      <input
                        className="w-full text-sm border border-gray-300 rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={editInput}
                        autoFocus
                        onChange={(e) => setEditInput(e.target.value)}
                        onBlur={() => {
                          if (editInput.trim()) {
                            renameConversation(conv.id, editInput.trim());
                          }
                          setEditingChatId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && editInput.trim()) {
                            renameConversation(conv.id, editInput.trim());
                            setEditingChatId(null);
                          } else if (e.key === 'Escape') {
                            setEditingChatId(null);
                          }
                        }}
                      />
                    ) : (
                      <span className="truncate w-full text-left">{conv.title}</span>
                    )}
                  </div>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameClick(conv.id, conv.title);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(conv.id, conv.title);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenuPortal>
                </DropdownMenu>
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Custom Dialog for both Delete and Rename */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentAction?.type === 'delete' ? 'Delete chat?' : 'Rename chat'}
            </DialogTitle>
            <DialogDescription>
              {currentAction?.type === 'delete' ? (
                <>
                  This will delete <span className="font-bold">{currentAction?.chatTitle || ''}</span>.
                  <br />
                  Visit settings to delete any memories saved during this chat.
                </>
              ) : (
                'Enter the new name for this chat:'
              )}
            </DialogDescription>
          </DialogHeader>

          {currentAction?.type === 'rename' && (
            <input
              className="w-full p-2 border rounded mt-2"
              value={editInput}
              onChange={(e) => setEditInput(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleActionConfirm();
                }
              }}
            />
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant={currentAction?.type === 'delete' ? 'destructive' : 'default'}
              onClick={handleActionConfirm}
              className="w-full sm:w-auto"
            >
              {currentAction?.type === 'delete' ? 'Delete' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}