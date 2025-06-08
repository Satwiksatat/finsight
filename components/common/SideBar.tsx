// components/common/Sidebar.tsx
'use client';

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
  MessageSquarePlus,
  MessageSquareText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useChat } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

  function handleShare(id: string) {
    console.log(`Share chat: ${id}`);
  }

  function handleRename(id: string) {
    const newTitle = prompt("Enter a new name for this chat:");
    if (newTitle) {
      renameConversation(id, newTitle);
    }
  }

  function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this chat?")) {
      deleteConversation(id);
    }
  }

  function handleArchive(id: string) {
    archiveConversation(id);
  }

  return (
    <div className={cn("flex flex-col h-screen border-r border-border bg-muted/40 p-4 shrink-0 transition-all", collapsed ? "w-16" : "w-64")}> 
      <div className="flex items-center justify-between h-14 pb-4 border-b border-border">
        {!collapsed && <h2 className="text-xl font-semibold text-foreground">Chats</h2>}
        <div className="flex gap-2">
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={startNewChat}
              aria-label="Start new chat"
              className="text-primary hover:bg-primary/10"
            >
              <MessageSquarePlus className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            aria-label="Toggle sidebar"
            className="text-muted-foreground"
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <Separator className="my-4" />

      <ScrollArea className="flex-1 pr-1.5">
        <nav className="grid gap-2">
          {visibleConversations.map((conv) => (
            <div
              key={conv.id}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-all",
                "hover:bg-accent hover:text-accent-foreground",
                activeChatId === conv.id
                  ? "bg-secondary text-secondary-foreground font-semibold"
                  : "text-muted-foreground"
              )}
            >
              <div
                onClick={() => setActiveChatId(conv.id)}
                className="flex items-center gap-2 cursor-pointer flex-grow overflow-hidden"
              >
                <MessageSquareText className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <div className="flex flex-col overflow-hidden flex-grow">
                    <span className="truncate w-full text-left">{conv.title}</span>
                    <span className="text-xs text-muted-foreground truncate w-full text-left mt-0.5">
                      {conv.lastMessageSnippet || 'No messages'}
                    </span>
                  </div>
                )}
                {/* {!collapsed && (
                  <span className="ml-auto text-xs text-muted-foreground shrink-0">
                    {new Date(conv.timestamp).toLocaleDateString()}
                  </span>
                )} */}
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
                      <DropdownMenuItem onClick={() => handleRename(conv.id)}>
                        <Pencil className="w-4 h-4 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(conv.id)}>
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
    </div>
  );
}
