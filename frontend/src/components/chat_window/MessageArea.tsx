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
  isGroupChat,
}: MessageAreaProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getInitials = (name?: string) => {
    if (!name || name === "Unknown User") return "U";

    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();

    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

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
              className={`flex flex-col ${
                msg.isMe ? "items-end" : "items-start"
              }`}
            >
              {/* MESSAGE ROW */}
              <div className="flex items-end gap-2 group">
                {/* AVATAR (GROUP ONLY, OTHER USERS ONLY) */}
                {isGroupChat && !msg.isMe && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 border flex items-center justify-center text-[11px] font-semibold shrink-0">
                    {getInitials(msg.sender.fullName)}
                  </div>
                )}

                {/* MESSAGE BUBBLE */}
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

                {/* 3-dot menu (UI only) */}
                <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" />
              </div>

              {/* TIME + READ RECEIPT */}
              <div className="flex items-center gap-1 px-1 mt-1">
                <span className="text-[10px] text-muted-foreground font-medium">
                  {msg.time}
                </span>
                {msg.isMe && (
                  <span className="text-primary text-[10px]">✓✓</span>
                )}
              </div>
            </div>
          ))}

          <div ref={scrollRef} />
        </div>
      )}
    </ScrollArea>
  );
};

export default MessageArea;
