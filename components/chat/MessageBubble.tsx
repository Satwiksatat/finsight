'use client';

import React, { useState } from 'react';
import { ChatMessage, LLMContent } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ResponseMessage } from './ResponseMessage';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, MessageSquareText, Send } from 'lucide-react';
import { toast } from 'sonner';
import { DEFAULT_USER_ID } from '@/lib/constants';

interface MessageBubbleProps {
  message: ChatMessage;
  onContentClick?: (content: LLMContent) => void;
  isClickable?: boolean;
}

export function MessageBubble({ message, onContentClick, isClickable = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const agentName = message.metadata?.skill || message.metadata?.agent || 'chat';

  const submitFeedback = async (score: number, noteOverride?: string) => {
    try {
      setSubmitting(true);
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: DEFAULT_USER_ID,
          agent_name: agentName,
          message_id: message.id,
          score,
          notes: noteOverride,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to send feedback');
      }
      setLastScore(score);
      if (noteOverride !== undefined) {
        setNotes('');
        setFeedbackOpen(false);
      }
      toast.success('Thanks for the feedback!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDetailedFeedback = () => {
    const trimmed = notes.trim();
    if (!trimmed) {
      toast.error('Please add a short note before sending.');
      return;
    }
    submitFeedback(0, trimmed);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2 max-w-[90%] break-words',
        isUser ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      <Card
        className={cn(
          'p-4 shadow-sm transition-all duration-300 w-full',
          'min-w-[150px]',
          isUser ? 'message-user' : 'message-assistant'
        )}
      >
        <CardContent className="p-0 text-sm leading-relaxed space-y-2">
          {message.content.map((contentBlock, index) => (
            <ResponseMessage
              key={index}
              content={contentBlock}
              onContentClick={onContentClick}
              isClickable={isClickable && !isUser}
            />
          ))}
        </CardContent>
      </Card>

      {!isUser && (
        <div className="w-full space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <Tooltip content="Thumbs up">
              <button
                type="button"
                disabled={submitting}
                onClick={() => submitFeedback(1)}
                className={cn(
                  'p-2 rounded-full border transition-colors flex items-center justify-center',
                  lastScore === 1 ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'hover:bg-muted'
                )}
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
            </Tooltip>

            <Tooltip content="Thumbs down">
              <button
                type="button"
                disabled={submitting}
                onClick={() => submitFeedback(-1)}
                className={cn(
                  'p-2 rounded-full border transition-colors flex items-center justify-center',
                  lastScore === -1 ? 'bg-rose-100 text-rose-600 border-rose-200' : 'hover:bg-muted'
                )}
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </Tooltip>

            <Tooltip content="Send feedback">
              <button
                type="button"
                onClick={() => setFeedbackOpen((prev) => !prev)}
                className={cn(
                  'p-2 rounded-full border transition-colors flex items-center justify-center',
                  feedbackOpen ? 'bg-primary/10 text-primary border-primary/20' : 'hover:bg-muted'
                )}
              >
                <MessageSquareText className="h-4 w-4" />
              </button>
            </Tooltip>

            {lastScore !== null && <span className="text-xs text-muted-foreground">Feedback noted</span>}
          </div>

          {feedbackOpen && (
            <div className="space-y-2 border rounded-lg p-3 bg-background">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share more context for the team..."
                rows={3}
                className="text-sm"
              />
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => {
                    setFeedbackOpen(false);
                    setNotes('');
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  type="button"
                  onClick={handleDetailedFeedback}
                  disabled={submitting || !notes.trim()}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Send
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
