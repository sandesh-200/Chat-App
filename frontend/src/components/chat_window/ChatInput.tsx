import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  return (
    <footer className="p-3 bg-background border-t">
      {/* AI Suggestions Panel */}
      {ai.show && (
        <div className="mb-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
              <span>✨</span> AI Suggestions
            </p>
            <button
              onClick={() => ai.setShow(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {ai.loading ? (
            <span className="animate-pulse text-xs text-muted-foreground">
              Thinking…
            </span>
          ) : (
            <div className="flex flex-col gap-1">
              {ai.suggestions.map((s, i) => (
                <button
                  key={i}
                  className="text-left text-sm px-3 py-2 rounded-md border border-transparent hover:border-border hover:bg-background transition-colors"
                  onClick={() => {
                    setText(s);
                    ai.setShow(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-center gap-2 border rounded-xl px-3 py-1.5 bg-muted/30 focus-within:border-ring transition-colors">
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-8 w-8 shrink-0 rounded-lg",
            ai.show && "bg-primary/10 text-primary",
          )}
          onClick={ai.fetch}
        >
          ✨
        </Button>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            !e.shiftKey &&
            (e.preventDefault(), onSendMessage())
          }
          placeholder="Enter message…"
          className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-1"
        />
        <Button
          size="sm"
          className="h-8 px-4 shrink-0"
          onClick={onSendMessage}
          disabled={!text.trim()}
        >
          Send
        </Button>
      </div>
    </footer>
  );
};

export default ChatInput;
