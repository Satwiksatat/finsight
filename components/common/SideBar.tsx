// components/common/Sidebar.tsx
'use client';

import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageSquarePlus, MessageSquareText } from 'lucide-react'; // Icons from lucide-react
import { useChat } from '@/context/ChatContext'; // Custom chat context hook
import { cn } from '@/lib/utils'; // Utility for conditional classnames

export function Sidebar() {
  const { conversations, activeChatId, setActiveChatId, startNewChat } = useChat();

  return (
    // Main sidebar container.
    // - flex flex-col: Stacks its content vertically.
    // - h-screen: Takes full viewport height.
    // - w-64: Fixed width of 64 Tailwind units (16rem).
    // - border-r border-border: Adds a right border with theme color.
    // - bg-card: Sets the background color using the card theme variable. (More common for sidebars than muted/40)
    // - p-4: Padding on all sides.
    // - shrink-0: Prevents the sidebar from shrinking when flex container space is limited.
    <div className="flex flex-col h-screen w-64 border-r border-border bg-card p-4 shrink-0">
      {/* Header section for the sidebar */}
      <div className="flex items-center justify-between h-14 pb-4 border-b border-border"> {/* Added pb-4 and border-b */}
        <h2 className="text-xl font-semibold text-foreground">Chats</h2> {/* Ensure text color */}
        <Button
          variant="ghost"
          size="icon"
          onClick={startNewChat}
          aria-label="Start new chat"
          className="text-primary hover:bg-primary/10" // Style for new chat button icon
        >
          <MessageSquarePlus className="h-5 w-5" />
        </Button>
      </div>

      <Separator className="my-4" /> {/* Separator with vertical margin */}

      {/* Scrollable area for the list of conversations */}
      <ScrollArea className="flex-1 pr-4"> {/* flex-1 allows it to take remaining vertical space, pr-4 for scrollbar padding */}
        <nav className="grid gap-2"> {/* grid gap-2 for spacing between items */}
          {conversations.map((conv) => (
            <Link
              key={conv.id}
              href="#" // You might change this to `/chat/${conv.id}` for actual Next.js routing
              onClick={() => setActiveChatId(conv.id)}
              className={cn(
                // Base styles for chat item link
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all", // Changed rounded-lg to rounded-md for subtler curve
                "hover:bg-accent hover:text-accent-foreground", // Accent hover state
                // Conditional styles for active chat item
                activeChatId === conv.id
                  ? "bg-secondary text-secondary-foreground font-semibold" // Active state with secondary background and text
                  : "text-muted-foreground" // Inactive state text color
              )}
            >
              <MessageSquareText className="h-4 w-4 shrink-0" /> {/* shrink-0 prevents icon from shrinking */}
              <div className="flex flex-col overflow-hidden flex-grow"> {/* flex-grow to allow text to take space */}
                <span className="truncate w-full text-left">
                  {conv.title}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full text-left mt-0.5"> {/* Added mt-0.5 for small gap */}
                  {conv.lastMessageSnippet || 'No messages'}
                </span>
              </div>
              <span className="ml-auto text-xs text-muted-foreground shrink-0"> {/* shrink-0 to prevent timestamp from shrinking */}
                {new Date(conv.timestamp).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}