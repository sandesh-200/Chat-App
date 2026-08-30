import React, { useRef, useEffect, useState } from "react";
import { SendHorizontal, Sparkles, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  text: string;
  setText: (val: string) => void;
  onSendMessage: () => void;
  ai: {
    show: boolean;
    loading: boolean;
    suggestions: string[];
    setShow: (val: boolean) => void;
    fetch: () => void;
  };
}

const ChatInput = ({ text, setText, onSendMessage, ai }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Auto-resize textarea height dynamically with max boundary
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${newHeight}px`;
  }, [text]);

  const canSend = text.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent submission during IME composition sequences
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      if (canSend) {
        onSendMessage();
      }
    }
  };

  return (
    <footer className="w-full bg-background/95 backdrop-blur-md border-t border-border/50 px-3 py-2.5 sm:px-4 shrink-0">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* AI Suggestions Floating Drawer */}
        {ai.show && (
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 shadow-lg backdrop-blur-sm animate-in fade-in-50 slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>AI Suggestions</span>
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
                onClick={() => ai.setShow(false)}
                aria-label="Close AI suggestions"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            {ai.loading ? (
              <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Thinking up suggestions...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {ai.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="text-left text-xs px-3 py-1.5 rounded-full border border-border/70 bg-background hover:bg-accent hover:border-accent-foreground/20 transition-all leading-normal text-foreground cursor-pointer shadow-2xs"
                    onClick={() => {
                      setText(suggestion);
                      ai.setShow(false);
                      textareaRef.current?.focus();
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messenger-Style Pill Input Capsule */}
        <div className="flex items-end gap-1.5 rounded-[24px] border border-border/70 bg-muted/30 px-2 py-1.5 transition-all duration-200 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-background focus-within:shadow-xs">
          {/* AI Trigger Action Button */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mb-0.5",
                    ai.show && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                  onClick={ai.fetch}
                  aria-label="Get AI suggestions"
                >
                  <Sparkles className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                AI Suggestions
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Multiline Textarea Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Aa"
            aria-label="Message input"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none py-1.5 px-1 min-h-[36px] max-h-[150px] leading-relaxed scrollbar-thin"
          />

          {/* Send Action Button */}
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={onSendMessage}
                  disabled={!canSend}
                  className={cn(
                    "h-8 w-8 shrink-0 rounded-full transition-all duration-150 mb-0.5",
                    canSend
                      ? "bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-95"
                      : "bg-transparent text-muted-foreground/40 hover:bg-transparent cursor-not-allowed"
                  )}
                  aria-label="Send message"
                >
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Send Message
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </footer>
  );
};

export default ChatInput;