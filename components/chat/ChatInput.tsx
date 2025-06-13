// components/chat/ChatInput.tsx
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizonal, Loader2, Paperclip, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  inputMessage: string;
  setInputMessage: (message: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  className?: string;
  onAttachFile?: () => void;
  onAttachImage?: () => void;
  isCentered?: boolean;
}

export function ChatInput({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isLoading,
  className = '',
  onAttachFile,
  onAttachImage,
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
      "relative w-full",
      isCentered ? "max-w-2xl mx-auto" : "",
      className
    )}>
      <div className={cn(
        "relative w-full",
        isCentered ? "min-h-[120px]" : "min-h-[80px]"
      )}>
        {/* Attachment buttons with proper spacing */}
        <div className="absolute left-3 bottom-3 flex gap-2 z-10">
          <button
            type="button"
            onClick={onAttachFile}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-accent transition-colors "
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={onAttachImage}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-accent transition-colors"
            aria-label="Attach image"
          >
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <Textarea
          placeholder="Ask me anything"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
          className={cn(
            "w-full resize-none pr-12 pl-5 rounded-xl", // Increased left padding
            "border border-input shadow-sm",
            "text-base", // Consistent text size
            isLoading && "opacity-50 cursor-not-allowed",
            isCentered ? "min-h-[120px]" : "min-h-[80px]"
          )}
        />
        
        <Button
          type="submit"
          size="icon"
          className={cn(
            "absolute right-3 bottom-3 rounded-full bg-ring text-primary-foreground",
            "disabled:bg-gray-200 disabled:text-gray-500",
            "disabled:cursor-not-allowed h-9 w-9" // Slightly larger button
          )}
          onClick={onSendMessage}
          disabled={isLoading || inputMessage.trim() === ''}
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}