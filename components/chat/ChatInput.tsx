// components/chat/ChatInput.tsx
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Send, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  className?: string;
  onAttachFile?: () => void;
  isCentered?: boolean;
  isUploading?: boolean;
}

export function ChatInput({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  className = '',
  onAttachFile,
  isCentered = false,
  isUploading = false,
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
      isCentered ? "max-w-3xl mx-auto" : "",
      className
    )}>
      <div className={cn(
        "relative w-full group",
        isCentered ? "min-h-[120px]" : "min-h-[80px]"
      )}>
        {/* Performance indicator */}
        <div className="absolute -top-1 left-0 right-0 h-1 overflow-hidden rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity">
          <div className="performance-meter" />
        </div>
        {/* Document upload button with CSS tooltip */}
        <div className="absolute left-3 bottom-3 z-10 pl-4 group">
          <button
            type="button"
            onClick={onAttachFile}
            disabled={isLoading || isUploading}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300",
              "text-sm text-muted-foreground relative",
              "bg-secondary/10 hover:bg-primary hover:text-primary-foreground"
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

        {/* Textarea with athletic styling */}
        <Textarea
          placeholder="Ask about revenue forecast, vendor expenses, or financial KPIs..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
          className={cn(
            "w-full resize-none pr-20 pl-20 rounded-2xl h-20",
            "py-4 font-medium",
            "bg-card border-2 border-primary/20 focus:border-primary",
            "text-foreground placeholder:text-muted-foreground/60",
            "transition-all duration-300",
            "focus:shadow-lg focus:shadow-primary/20",
            isLoading && "opacity-50 cursor-not-allowed",
            isCentered ? "min-h-[120px]" : "min-h-[80px]"
          )}
        />

        {/* Submit button - vertically centered on right */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <Button
            type="submit"
            size="icon"
            variant="sport"
            className={cn(
              "rounded-full h-12 w-12",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "group/send"
            )}
            onClick={onSendMessage}
            disabled={isLoading || isUploading || inputMessage.trim() === ''}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="agilitas-loader w-6 h-6" />
            ) : (
              <Zap className="h-5 w-5 group-hover/send:rotate-12 transition-transform" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}