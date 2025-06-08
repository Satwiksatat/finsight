// components/chat/ChatInput.tsx
import React from 'react';
import { Textarea } from '@/components/ui/textarea'; // Shadcn Textarea
import { Button } from '@/components/ui/button';     // Shadcn Button
import { SendHorizonal, Loader2 } from 'lucide-react'; // Icons from lucide-react (make sure installed)
import { cn } from '@/lib/utils'; // Import cn for utility classes

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

export function ChatInput({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allows sending message on Enter key press without Shift, and only if not loading
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault(); // Prevent new line in textarea
      onSendMessage();
    }
  };

  return (
    // Container for the textarea and send button.
    // - relative: Needed for the absolute positioning of the send button.
    // - flex items-end gap-2: Arranges children in a row, aligns them to the bottom, with a 2-unit gap.
    <div className="relative w-full">
      <Textarea
        placeholder="Type your message..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1} // Starts with 1 row, will grow with content due to resize-none and min-h
        disabled={isLoading} // Disable input while loading
        // Tailwind classes for styling:
        // - flex-1: Allows textarea to grow and take remaining width.
        // - min-h-[40px]: Sets a minimum height.
        // - resize-none: Prevents manual resizing by user.
        // - pr-12: Adds padding-right to make space for the absolutely positioned button.
        // - focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2: Enhances focus outline.
        // - rounded-lg: Adds rounded corners.
        // - border border-input: Adds a border using the input color.
        className={cn(
          "w-full min-h-[40px] resize-none pr-12 rounded-xl",
      "border border-input shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      isLoading && "opacity-50 cursor-not-allowed"
        )}
      />
      <Button
        type="submit"
        size="icon" // Makes the button a square with icon sizing
        // Absolute positioning for the button:
        // - absolute right-2 bottom-2: Positions it 2 units from right and bottom of its relative parent.
        // - rounded-full: Makes the button perfectly circular.
        // - bg-primary text-primary-foreground: Applies primary theme colors.
        // - hover:bg-primary/90: Darkens on hover.
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black text-primary-foreground hover:bg-black/90 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
        onClick={onSendMessage}
        disabled={isLoading || inputMessage.trim() === ''} // Disable if loading or input is empty
        aria-label="Send message" // Accessibility
      >
        {/* Conditional icon rendering based on loading state */}
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizonal className="h-4 w-4" />
        )}
        <span className="sr-only">Send message</span> {/* Screen reader text */}
      </Button>
    </div>
  );
}