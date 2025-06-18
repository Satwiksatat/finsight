'use client';

import { useEffect, useState, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
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
  LineChart,
  PieChart,
  FileText as FileTextIcon,
  DollarSign,
  BarChart2,
  Landmark,
  ClipboardList
} from 'lucide-react';

import { PiSidebarSimple, PiSidebarFill } from 'react-icons/pi';

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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Conversation } from '@/lib/types';


type FinancialItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
};

const financialItems: FinancialItem[] = [
  { id: 'start-analysis', title: 'Start Analysis', icon: <LineChart className="w-4 h-4" /> },
  { id: 'q2-budget', title: 'Q2 Budget Review', icon: <PieChart className="w-4 h-4" /> },
  { id: 'vendor-expenses', title: 'Vendor Expenses', icon: <FileTextIcon className="w-4 h-4" /> },
  { id: 'revenue-forecast', title: 'Revenue Forecast', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'kpi-dashboard', title: 'KPI Dashboard', icon: <BarChart2 className="w-4 h-4" /> },
  { id: 'pl-statement', title: 'P&L Statement', icon: <Landmark className="w-4 h-4" /> },
  { id: 'balance-sheet', title: 'Balance Sheet', icon: <ClipboardList className="w-4 h-4" /> }
];

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

  const [visibleConversations, setVisibleConversations] = useState<Conversation[]>([]); // ✅ updated default

  useEffect(() => {
    const saved = localStorage.getItem('conversations');
    if (saved) {
      setVisibleConversations(JSON.parse(saved));
    } else {
      setVisibleConversations(conversations.filter((c) => !c.archived));
    }
  }, [conversations]); // ✅ place this immediately after the useState

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false);
  const [searchOverlayQuery, setSearchOverlayQuery] = useState('');
  const [filteredSearchConversations, setFilteredSearchConversations] = useState<Conversation[]>([]);
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

  useEffect(() => {
    const normalize = (text: string) => text.toLowerCase().trim();
    const filtered = conversations.filter(
      (c) =>
        !c.archived &&
        normalize(c.title).includes(normalize(searchOverlayQuery))
    );
    setFilteredSearchConversations(filtered);
  }, [searchOverlayQuery, conversations]);

  const groupConversations = (chats: Conversation[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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
      const chatDate = new Date(chat.createdAt);
      chatDate.setHours(0, 0, 0, 0);

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

  // Handler for financial item actions
  const handleFinancialItemAction = (action: string, itemId: string) => {
    switch (action) {
      case 'rename':
        toast.info(`Renaming ${itemId}`);
        break;
      case 'share':
        toast.info(`Sharing ${itemId}`);
        break;
      case 'archive':
        toast.info(`Archiving ${itemId}`);
        break;
      case 'delete':
        toast.warning(`Deleting ${itemId}`);
        break;
    }
  };
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    setShowLogo(true); // This only runs on the client
  }, []);


  return (
    <div
      className={cn(
        'flex flex-col h-screen transition-all ease-in-out shrink-0 overflow-y-auto sidebar-scroll',
        collapsed ? 'w-14 p-2' : 'w-64 p-4',
        'bg-sidebar',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-14 mb-4">
        {/* Only show logo when sidebar is not collapsed */}
        {!collapsed && (
          <div className="flex items-center">
            {showLogo && (
              <img
                src="/images/cfo.avif"
                alt="CFO Logo"
                className="h-10 w-auto mr-3"
              />
            )}

          </div>
        )}
        <Tooltip content={collapsed ? 'Open Sidebar' : 'Close Sidebar'}>
          <button
            className={cn(
              "text-gray-600 text-lg",
              collapsed ? "w-10 h-10" : "ml-auto w-10 h-10" // Adjust positioning based on collapsed state
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <PiSidebarFill className="h-6 w-6 ml-2" />
            ) : (
              <PiSidebarSimple className="w-6 h-6" />
            )}
          </button>
        </Tooltip>
      </div>

      {/* New Chat + Search Trigger */}
      {!collapsed && (
        <div className="flex flex-col items-start gap-4 pb-4 mb-2">
          <Button
            onClick={() => {
              startNewChat();
              setActiveChatId(null);
            }}
            className="w-full justify-start mb-2 bg-transparent text-foreground hover:bg-muted-foreground/10 font-medium">
            <MessageCirclePlus className="w-4 h-4 text-foreground" />New Chat
          </Button>

          <Button
            className="w-full justify-start mb-2 bg-transparent text-foreground hover:bg-muted-foreground/10 font-medium"
            onClick={() => setIsSearchDialogOpen(true)}
          >
            <Search className="w-4 h-4 text-foreground" />Search chats
          </Button>
        </div>
      )}

      {/* Chat List */}
      {!collapsed && (
        <div className="flex flex-col gap-2 pr-2 flex-1">
          {visibleConversations.map((chat: Conversation) => (
            <div
              key={chat.id}
              className={cn(
                'flex items-center justify-between px-3 py-2 text-sm text-foreground cursor-pointer',
                "hover:bg-muted-foreground/10",
                activeChatId === chat.id ? 'bg-muted-foreground/10 font-semibold' : 'bg-transparent',
                'rounded-md'
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
                  autoFocus
                />
              ) : (
                <span className="truncate">{chat.title}</span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
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

      {/* Financial Analysis Section */}
      {!collapsed && (
        <>
          <Separator className="my-2" />
          <div className="flex flex-col gap-2 pr-2 flex-1">
            <h3 className="text-xs font-semibold text-muted-foreground px-3 py-1">Financial Analysis</h3>
            {financialItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center justify-between px-3 py-2 text-sm text-foreground cursor-pointer',
                  "hover:bg-muted-foreground/10",
                  'rounded-md'
                )}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.title}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleFinancialItemAction('rename', item.id)}>
                      <Pencil className="w-4 h-4 mr-2" /> Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFinancialItemAction('share', item.id)}>
                      <Share className="w-4 h-4 mr-2" /> Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleFinancialItemAction('archive', item.id)}>
                      <Archive className="w-4 h-4 mr-2" /> Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleFinancialItemAction('delete', item.id)}
                      className="text-red-500 focus:bg-red-100">
                      <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Search Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="p-0 sm:max-w-md md:max-w-lg lg:max-w-xl">
          <DialogTitle className="hidden">Search chat</DialogTitle>
          <div className="flex items-center p-4 border-b">
            <Search className="w-5 h-5 mr-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full bg-transparent outline-none text-base"
              value={searchOverlayQuery}
              onChange={(e) => setSearchOverlayQuery(e.target.value)}
              autoFocus
            />
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
                          setIsSearchDialogOpen(false);
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

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
            <br></br>
            <DialogDescription>
              Are you sure you want to delete "
              <strong>{currentAction?.chatTitle}</strong>"?
            </DialogDescription>
          </DialogHeader><br></br>
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