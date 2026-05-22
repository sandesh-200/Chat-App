import { useEffect, useRef } from "react";
import { Copy, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import type { MessageAreaProps } from "@/types/chat";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";

const MessageArea = ({
  messages,
  isLoading,
  onDeleteMessage,
}: MessageAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Auto-scroll logic
  useEffect(() => {
    // Timeout ensures the DOM has finished painting the new message
    // before we calculate the scroll position.
    const timer = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]); // Fires whenever the messages array reference changes

  return (
    <ScrollArea className="flex-1 p-4">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Fetching messages...
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 pb-4">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1 group">
                {!msg.isMe && (
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" />
                )}
                <ContextMenu>
                  <ContextMenuTrigger>
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.isMe
                          ? "bg-accent text-accent-foreground rounded-tr-none"
                          : "bg-secondary/50 text-foreground rounded-tl-none border"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </ContextMenuTrigger>

                  <ContextMenuContent className="w-48">
                    <ContextMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(msg.text);
                      }}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </ContextMenuItem>

                    {msg.isMe && (
                      <ContextMenuItem
                        className="text-red-500 focus:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteMessage(msg.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </ContextMenuItem>
                    )}
                  </ContextMenuContent>
                </ContextMenu>
                {msg.isMe && (
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" />
                )}
              </div>
              <div className="flex items-center gap-1 px-1">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {msg.time}
                </span>
                {msg.isMe && (
                  <span className="text-primary text-[10px]">✓✓</span>
                )}
              </div>
            </div>
          ))}
          {/* 2. The Anchor: Bottom of this div is the "end" of the chat */}
          <div ref={scrollRef} />
        </div>
      )}
    </ScrollArea>
  );
};

export default MessageArea;
