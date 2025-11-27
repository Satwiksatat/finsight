'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

import {
  AlertTriangle,
  Archive,
  BarChart2,
  ClipboardList,
  FileText as FileTextIcon,
  LineChart,
  MessageCirclePlus,
  MessageSquareText,
  MoreVertical,
  Pencil,
  Search,
  Share,
  Target,
  Trash2,
} from 'lucide-react';

import { PiSidebarSimple, PiSidebarFill } from 'react-icons/pi';

import { Tooltip } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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
  description?: string;
  icon: React.ReactNode;
  href?: string;
};

type AlertSummary = {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  updatedAt: string;
};

const financialItems: FinancialItem[] = [
  {
    id: 'launch-estimates',
    title: 'Launch Project Estimates',
    description: 'Q4 SKU expansion',
    icon: <LineChart className="w-4 h-4" />,
    href: '/analytics',
  },
  {
    id: 'balance-sheet',
    title: 'Balance Sheet Review',
    description: 'Net cash & leverage',
    icon: <ClipboardList className="w-4 h-4" />,
    href: '/analytics?view=balance',
  },
  {
    id: 'income-statement',
    title: 'Income Statement',
    description: 'Variance insights',
    icon: <FileTextIcon className="w-4 h-4" />,
    href: '/reports',
  },
  {
    id: 'forecast',
    title: 'Revenue Forecast',
    description: 'Scenario studio',
    icon: <BarChart2 className="w-4 h-4" />,
    href: '/forecasting',
  },
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

  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{
    type: 'delete';
    chatId: string;
    chatTitle: string;
  } | null>(null);

  const [visibleConversations, setVisibleConversations] = useState<Conversation[]>([]);
  const [alerts, setAlerts] = useState<AlertSummary[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('conversations');
    if (saved) {
      setVisibleConversations(JSON.parse(saved));
    } else {
      setVisibleConversations(conversations.filter((c) => !c.archived));
    }
  }, [conversations]); // ✅ place this immediately after the useState

  useEffect(() => {
    const loadAlerts = async () => {
      setAlertsLoading(true);
      try {
        const response = await fetch('/api/dashboard/alerts', { cache: 'no-store' });
        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (error) {
        console.warn('Failed to fetch alerts', error);
      } finally {
        setAlertsLoading(false);
      }
    };
    loadAlerts();
  }, []);

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

  const severityTone = (severity: AlertSummary['severity']) => {
    switch (severity) {
      case 'critical':
        return 'text-rose-400';
      case 'warning':
        return 'text-amber-300';
      default:
        return 'text-[#53AAA3]';
    }
  };

  const handleQuickLinkClick = (item: FinancialItem) => {
    if (item.href) {
      router.push(item.href);
    } else {
      toast.info('Coming soon');
    }
  };

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

  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    setShowLogo(true); // This only runs on the client
  }, []);


  return (
    <div className={cn(
      'flex flex-col h-screen transition-all ease-in-out shrink-0 overflow-y-auto sidebar-scroll relative',
      collapsed ? 'w-14 p-2' : 'w-72 p-4',
      'bg-card border-r-2 border-primary/20',
      'dark:bg-[hsl(var(--sidebar-background))]'
    )}>
      {/* Speed lines background effect - only in dark mode */}
      <div className="speed-lines opacity-0 dark:opacity-100" />

      {/* Header */}
      <div className="flex items-center justify-between h-14 mb-4">
        {/* Only show logo when sidebar is not collapsed */}
        {!collapsed && (
          <div className="flex items-center">
            {showLogo && (
              <Image
                src="/images/agilitas-logo.svg"
                alt="Agilitas Logo"
                width={120}
                height={40}
                className="h-10 w-auto mr-3"
                priority
              />
            )}

          </div>
        )}
        <Tooltip content={collapsed ? 'Open Sidebar' : 'Close Sidebar'}>
          <button
            className={cn(
              "text-foreground hover:text-primary transition-colors text-lg", 
              collapsed ? "w-10 h-10" : "ml-auto w-10 h-10"
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

      {!collapsed && (
        <div className="flex flex-col gap-4 mb-4">
          <div className="rounded-2xl bg-gradient-to-br from-[#212F34] to-[#111A1B] text-white p-4 border border-white/10 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-[0.35em] text-[#9FC6D5]">Proactive alerts</p>
              <button
                className="text-[10px] uppercase tracking-widest text-[#A3CADA]"
                onClick={() => router.push('/analytics')}
              >
                View all
              </button>
            </div>
            <div className="space-y-3">
              {alertsLoading && <div className="text-xs text-[#9FC6D5]">Syncing telemetry…</div>}
              {!alertsLoading && alerts.length === 0 && (
                <p className="text-xs text-[#9FC6D5]">No active alerts. Cash and margins stable.</p>
              )}
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className="flex gap-3 rounded-2xl bg-white/5 px-3 py-2 border border-white/10">
                  <AlertTriangle className={`w-4 h-4 mt-1 ${severityTone(alert.severity)}`} />
                  <div>
                    <p className="text-sm font-semibold leading-tight">{alert.title}</p>
                    <p className="text-xs text-[#9FC6D5]">{alert.description}</p>
                    <span className="text-[10px] uppercase tracking-widest text-[#688790]">{alert.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/70 dark:bg-[#111A1B]/80 border border-white/30 p-4 shadow">
            <p className="text-xs uppercase tracking-[0.35em] text-[#688790] mb-3">Command shortcuts</p>
            <div className="space-y-2">
              {financialItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleQuickLinkClick(item)}
                  className="w-full flex items-center justify-between text-left px-3 py-2 rounded-2xl border border-white/60 dark:border-white/10 hover:border-[#53AAA3] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-2xl bg-[#DEEDF2] dark:bg-[#0F191B] text-[#212F34]">
                      {item.icon}
                    </span>
                    <span>
                      <p className="text-sm font-semibold text-[#212F34] dark:text-white">{item.title}</p>
                      {item.description && <p className="text-[11px] text-[#688790]">{item.description}</p>}
                    </span>
                  </div>
                  <Target className="w-4 h-4 text-[#A3CADA]" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Chat + Search Trigger */}
      {!collapsed && (
        <div className="flex flex-col items-start gap-4 pb-4 mb-2">
          <Button
            onClick={() => {
              startNewChat();
            }}
            variant="sport"
            className="w-full justify-start mb-2 group">
            <MessageCirclePlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />New Chat
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start mb-2"
            onClick={() => setIsSearchDialogOpen(true)}
          >
            <Search className="w-4 h-4" />Search chats
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
                'flex items-center justify-between px-3 py-2 text-sm cursor-pointer group text-foreground',
                'hover:bg-gradient-to-r hover:from-primary/10 hover:to-transparent',
                'hover:border-l-4 hover:border-primary transition-all duration-200',
                activeChatId === chat.id ? 'bg-gradient-to-r from-primary/20 to-transparent border-l-4 border-primary font-bold' : 'bg-transparent',
                'rounded-r-md'
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
              <DropdownMenuContent className="bg-card z-50">
                  <DropdownMenuItem onClick={() => {
                    setEditingChatId(chat.id);
                    setEditInput(chat.title);
                  }}className="text-[#6F4E33]"> 
                    <Pencil className="w-4 h-4 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(chat.id)}className="text-[#6F4E33]"> 
                    <Share className="w-4 h-4 mr-2" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleArchive(chat.id)} className="text-[#6F4E33]"> 
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
          <DialogTitle className="text-[#6F4E33]">Delete chat?</DialogTitle> 
            <br></br>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{currentAction?.chatTitle}</strong>
              ?
            </DialogDescription>
          </DialogHeader><br></br>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}className="text-[#6F4E33]">
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