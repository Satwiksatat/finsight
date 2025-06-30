// components/chat/ChatInput.tsx
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  className?: string;
  onAttachFile?: () => void;
  isCentered?: boolean;
}

export function ChatInput({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  className = '',
  onAttachFile,
  isCentered = false,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className={cn(
      "relative w-full transition-all duration-300",
      isCentered ? "max-w-2xl mx-auto" : "",
      className
    )}>
      <div className={cn(
        "relative w-full",
        isCentered ? "min-h-[120px]" : "min-h-[80px]"
      )}>
        {/* Document upload button with CSS tooltip */}
        <div className="absolute left-3 bottom-3 z-10 pl-4 group">
          <button
            type="button"
            onClick={onAttachFile}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full hover:bg-accent transition-colors",
              "text-sm text-muted-foreground relative",
              "bg-background"
            )}
            aria-label="Upload financial document"
          >
            <FileText className="h-4 w-4" />
            {/* CSS Tooltip */}
            <span className="
              absolute -top-10 left-1/2 -translate-x-1/2
              bg-gray-800 text-white text-xs
              px-2 py-1 rounded whitespace-nowrap
              opacity-0 group-hover:opacity-100 transition-opacity
              pointer-events-none
            ">
              Upload Financial Document
              <span className="
                absolute bottom-0 left-1/2 -translate-x-1/2
                w-2 h-2 bg-gray-800 rotate-45
                -mb-1
              "></span>
            </span>
          </button>
        </div>

        {/* Textarea with fully rounded styling */}
        <Textarea
          placeholder="Ask about revenue forecast, vendor expenses, or financial KPIs..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
          className={cn(
            "w-full resize-none pr-16 pl-8 rounded-full h-20",
            "border border-input shadow-sm py-4",
            "text-base placeholder:text-muted-foreground/70",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isLoading && "opacity-50 cursor-not-allowed",
            isCentered ? "min-h-[120px]" : "min-h-[80px]"
          )}
        />

        {/* Submit button - vertically centered on right */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <Button
            type="submit"
            size="icon"
            className={cn(
              "rounded-full bg-[hsl(var(--ring))] text-[hsl(var(--primary-foreground))]",
              "hover:brightness-110",
              "disabled:bg-muted disabled:text-muted-foreground",
              "disabled:cursor-not-allowed h-10 w-10",
              "transition-all shadow-md"
            )}

            onClick={onSendMessage}
            disabled={isLoading || inputMessage.trim() === ''}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}