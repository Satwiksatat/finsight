'use client';

import { useEffect, useState, useRef } from 'react'; // Added useRef here
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
import { PiSidebarSimple,
  PiSidebarFill
 } from "react-icons/pi";
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
import { Conversation } from '@/lib/types';


// IMPORTANT: Ensure your Conversation type has a 'createdAt' property.
// Example:



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

  // Existing state for sidebar search (can be removed if only using dialog search)
  // I'm keeping it for now, assuming visibleConversations is still needed for the main sidebar display
  const [visibleConversations, setVisibleConversations] = useState<Conversation[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('conversations');
      return saved ? JSON.parse(saved) : conversations.filter((c) => !c.archived);
    }
    return conversations.filter((c) => !c.archived);
  });
  const [searchQuery, setSearchQuery] = useState(''); // This is for the old search input, can be removed
  const inputRef = useRef<HTMLInputElement | null>(null);

  // NEW STATES FOR SEARCH DIALOG
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchOverlayQuery, setSearchOverlayQuery] = useState('');
  const [filteredSearchConversations, setFilteredSearchConversations] = useState<Conversation[]>([]);


  // Effect for inline editing focus
  useEffect(() => {
    if (editingChatId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingChatId]);

  // Effect for filtering main sidebar chats (if you still need this separate from the dialog search)
  // If you only want the dialog search, you can simplify this or remove the `searchQuery` state.
  useEffect(() => {
    const normalize = (text: string) => text.toLowerCase().trim();
    const filtered = conversations.filter(
      (c) =>
        !c.archived &&
        normalize(c.title).includes(normalize(searchQuery))
    );
    setVisibleConversations(filtered);
  }, [searchQuery, conversations]);


  // Effect for filtering search dialog chats
  useEffect(() => {
    const normalize = (text: string) => text.toLowerCase().trim();
    const filtered = conversations.filter(
      (c) =>
        !c.archived &&
        normalize(c.title).includes(normalize(searchOverlayQuery))
    );
    setFilteredSearchConversations(filtered);
  }, [searchOverlayQuery, conversations]);


  // Helper function to group conversations by date for the search dialog
  const groupConversations = (chats: Conversation[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const groups: {
      Today: Conversation[];
      Yesterday: Conversation[];
      'Previous 7 Days': Conversation[];
      Older: Conversation[];
    } = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    chats.forEach((chat) => {
      // Ensure chat.createdAt is a Date object. If it's a string, parse it: new Date(chat.createdAt)
      const chatDate = new Date(chat.createdAt);
      chatDate.setHours(0, 0, 0, 0); // Normalize chat date to start of day

      if (chatDate.getTime() === today.getTime()) {
        groups.Today.push(chat);
      } else if (chatDate.getTime() === yesterday.getTime()) {
        groups.Yesterday.push(chat);
      } else if (chatDate > sevenDaysAgo) {
        groups['Previous 7 Days'].push(chat);
      } else {
        groups.Older.push(chat);
      }
    });

    return groups;
  };

  const groupedSearchConversations = groupConversations(filteredSearchConversations);


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
        'flex flex-col h-screen border-r transition-all duration-300 ease-in-out shrink-0 overflow-y-auto',
        collapsed ? 'w-14 p-2' : 'w-64 p-4',
        // --- MODIFIED CLASSES HERE ---
        'bg-background border-border', // Use background and border variables
        // Tailwind's dark: variant will automatically apply the .dark variables
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
            className="ml-auto w-16 h-16 p-3 hover:bg-gray-200 rounded-xl transition"
          >
          <PiSidebarSimple className="w-10 h-10 text-gray-800" />
          </Button>
        </Tooltip>
      </div>

      {/* New Chat + Search Trigger (Modified) */}
      {!collapsed && (
        <div className="flex flex-col items-start gap-4 pb-4 mb-2">
          <Button
            onClick={() => {
              startNewChat();
              setActiveChatId(null); // Clear active chat when starting a new one
            }}
            className="w-full justify-start mb-2 bg-transparent text-foreground hover:bg-muted-foreground/10 font-medium">

            <MessageCirclePlus className="w-4 h-4 mr-2 text-foreground" /> New Chat
          </Button>

          {/* *** CHANGE 2: REPLACE THE OLD INPUT WITH THIS SEARCH TRIGGER *** */}
          <div
            className="flex items-center w-full px-3 py-2 text-sm text-foreground cursor-pointer hover:bg-muted-foreground/10 rounded-md"
            onClick={() => setIsSearchDialogOpen(true)}
          >
            <Search className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>Search chats</span>
          </div>
        </div>
      )}

      {/* Chat List (Modified for homogeneous styling and no inner ScrollArea) */}
      {!collapsed && (

        <div className="flex flex-col gap-2 pr-2 flex-1"> {/* Added flex-1 */}
          {visibleConversations.map((chat: Conversation) => (
            <div
              key={chat.id}
              className={cn(
                'flex items-center justify-between px-3 py-2 text-sm text-foreground cursor-pointer', // text-foreground
                'hover:bg-accent hover:text-accent-foreground', // Use accent for hover
                activeChatId === chat.id ? 'bg-accent text-accent-foreground font-semibold' : 'bg-transparent', // Use accent for active
                'rounded-md' // Keep rounded corners if desired
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
                  <Button variant="ghost" size="icon" className="h-6 w-6"> {/* Adjusted button size */}
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
                  <DropdownMenuItem onClick={() => handleDeleteClick(chat.id, chat.title)}
                    className="text-red-500 focus:bg-red-100">
                    <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {/* *** CHANGE 4: ADD THIS ENTIRE SEARCH DIALOG COMPONENT *** */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="p-0 sm:max-w-md md:max-w-lg lg:max-w-xl">
          <div className="flex items-center p-4 border-b">
            <Search className="w-5 h-5 mr-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full bg-transparent outline-none text-base"
              value={searchOverlayQuery}
              onChange={(e) => setSearchOverlayQuery(e.target.value)}
              autoFocus // Auto-focus on the input when dialog opens
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsSearchDialogOpen(false);
                setSearchOverlayQuery(''); // Clear search query when closing
              }}
              className="ml-auto"
            >
              <span className="sr-only">Close</span>

            </Button>
          </div>
          <ScrollArea className="max-h-[500px] overflow-y-auto p-4">
            {Object.keys(groupedSearchConversations).map((groupKey) => {
              const chatsInGroup = groupedSearchConversations[groupKey as keyof typeof groupedSearchConversations];
              if (chatsInGroup.length === 0) return null;

              return (
                <div key={groupKey} className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 mb-2">{groupKey}</h3>
                  <div className="flex flex-col gap-2">
                    {chatsInGroup.map((chat) => (
                      <div
                        key={chat.id}
                        className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setActiveChatId(chat.id);
                          setIsSearchDialogOpen(false); // Close dialog on chat selection
                          setSearchOverlayQuery('');
                        }}
                      >
                        <MessageSquareText className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="truncate text-sm">{chat.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </DialogContent>
      </Dialog>


      {/* Confirmation Dialog (remains the same) */}
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
  );
}