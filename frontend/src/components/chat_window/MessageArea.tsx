import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Copy,
  Trash2,
  Clock,
  ArrowDown,
  MoreVertical,
  CheckCheck,
} from "lucide-react";

import type { MessageAreaProps } from "@/types/chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

// IMPORT YOUR NEW UTILS HERE:
import {
  getInitials,
  getDateSeparatorLabel,
  isTimeGapSignificant,
  getEmojiOnlyDetails
} from "@/utils/chat-utils";


// --- Sub-Components ---

const ConversationSkeleton = () => (
  <div className="flex flex-col gap-4 p-4">
    <div className="flex items-end gap-2 max-w-[70%]">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="space-y-1.5 w-full">
        <Skeleton className="h-10 w-full rounded-2xl rounded-bl-xs" />
        <Skeleton className="h-8 w-2/3 rounded-2xl rounded-bl-xs" />
      </div>
    </div>
    <div className="flex flex-col items-end gap-1.5 max-w-[70%] self-end w-full">
      <Skeleton className="h-12 w-3/4 rounded-2xl rounded-br-xs" />
    </div>
    <div className="flex items-end gap-2 max-w-[60%]">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <Skeleton className="h-9 w-full rounded-2xl rounded-bl-xs" />
    </div>
  </div>
);


// --- Main Message Area Component ---

const MessageArea = ({
  messages,
  isLoading,
  onDeleteMessage,
  isGroupChat = false,
}: MessageAreaProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const atBottom = distanceToBottom < 80;

    setIsAtBottom(atBottom);
    if (atBottom) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (isLoading || messages.length === 0) return;

    if (isAtBottom) {
      bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
    setUnreadCount(0);
  };

  const groupedMessages = useMemo(() => {
    return messages.map((msg, idx) => {
      const prevMsg = messages[idx - 1];
      const nextMsg = messages[idx + 1];

      const isFirstInGroup =
        !prevMsg ||
        prevMsg.isMe !== msg.isMe ||
        (isGroupChat && prevMsg.sender?._id !== msg.sender?._id) ||
        isTimeGapSignificant(prevMsg.time, msg.time);

      const isLastInGroup =
        !nextMsg ||
        nextMsg.isMe !== msg.isMe ||
        (isGroupChat && nextMsg.sender?._id !== msg.sender?._id) ||
        isTimeGapSignificant(msg.time, nextMsg.time);

      const dateSeparator = getDateSeparatorLabel(msg.time);
      const prevDateSeparator = prevMsg ? getDateSeparatorLabel(prevMsg.time) : null;
      const showDateBoundary = Boolean(dateSeparator && dateSeparator !== prevDateSeparator);

      return {
        ...msg,
        isFirstInGroup,
        isLastInGroup,
        showDateBoundary,
        dateSeparator,
      };
    });
  }, [messages, isGroupChat]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <ConversationSkeleton />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground select-none">
        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3 border border-border/40">
          <Clock className="h-5 w-5 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-foreground">No messages yet</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs leading-normal">
          Send a message to start the conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-background">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:px-6 space-y-1 scrollbar-thin"
        role="log"
        aria-live="polite"
        aria-label="Chat history"
      >
        {groupedMessages.map((msg, idx) => {
          const {
            id,
            text,
            time,
            isMe,
            sender,
            isFirstInGroup,
            isLastInGroup,
            showDateBoundary,
            dateSeparator,
          } = msg;

          // Check if message is strictly emoji-only via the utility function
          const { isEmojiOnly, count: emojiCount } = getEmojiOnlyDetails(text);

          const emojiSizeClass =
            emojiCount === 1 ? "text-5xl" : emojiCount === 2 ? "text-4xl" : "text-3xl";

          const bubbleRadiusClass = isMe
            ? `${isFirstInGroup ? "rounded-tr-2xl" : "rounded-tr-xs"} ${isLastInGroup ? "rounded-br-2xl" : "rounded-br-xs"
            } rounded-l-2xl`
            : `${isFirstInGroup ? "rounded-tl-2xl" : "rounded-tl-xs"} ${isLastInGroup ? "rounded-bl-2xl" : "rounded-bl-xs"
            } rounded-r-2xl`;

          return (
            <React.Fragment key={id || idx}>
              {showDateBoundary && (
                <div className="flex items-center justify-center my-4 py-1 select-none">
                  <span className="text-[11px] font-medium text-muted-foreground/80 bg-muted/60 dark:bg-muted/30 px-3 py-0.5 rounded-full border border-border/40 shadow-2xs">
                    {dateSeparator}
                  </span>
                </div>
              )}

              <div
                className={`flex flex-col ${isMe ? "items-end" : "items-start"
                  } ${isFirstInGroup && !showDateBoundary ? "mt-3" : "mt-0.5"}`}
              >
                {isGroupChat && !isMe && isFirstInGroup && (
                  <span className="text-[11px] font-semibold text-primary/90 ml-10 mb-1 tracking-tight">
                    {sender?.fullName || "Unknown"}
                  </span>
                )}

                <div className="flex items-end gap-2 group max-w-[85%] sm:max-w-[75%] relative">
                  {isGroupChat && !isMe && (
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                      {isLastInGroup ? (
                        <Avatar className="h-8 w-8 border border-border/40">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[11px]">
                            {getInitials(sender?.fullName)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8" />
                      )}
                    </div>
                  )}

                  <ContextMenu>
                    <ContextMenuTrigger asChild>
                      <div
                        className={`relative transition-colors break-words ${isEmojiOnly
                          ? `bg-transparent p-1 ${emojiSizeClass} leading-none`
                          : `px-3.5 py-2 text-sm leading-relaxed ${bubbleRadiusClass} ${isMe
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "bg-muted/70 dark:bg-muted/40 text-foreground border border-border/40"
                          }`
                          }`}
                      >
                        <p className="whitespace-pre-wrap selection:bg-background/20 select-text">
                          {text}
                        </p>

                        <div
                          className={`flex items-center justify-end gap-1 float-right ml-3 mt-1 text-[10px] select-none ${isEmojiOnly
                            ? "text-muted-foreground"
                            : isMe
                              ? "text-primary-foreground/75"
                              : "text-muted-foreground/75"
                            }`}
                        >
                          <time>{time}</time>
                          {isMe && (
                            <CheckCheck
                              className={`h-3.5 w-3.5 ${isEmojiOnly ? "text-primary" : "text-primary-foreground/90"
                                }`}
                            />
                          )}
                        </div>
                      </div>
                    </ContextMenuTrigger>

                    <ContextMenuContent className="w-44 text-xs">
                      <ContextMenuItem
                        className="cursor-pointer gap-2"
                        onClick={() => navigator.clipboard.writeText(text)}
                      >
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Copy text</span>
                      </ContextMenuItem>
                      {isMe && onDeleteMessage && (
                        <ContextMenuItem
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                          onClick={() => onDeleteMessage(id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Delete message</span>
                        </ContextMenuItem>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>

                  <div
                    className={`opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center shrink-0 ${isMe ? "order-first" : "order-last"
                      }`}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60"
                          aria-label="Message options"
                        >
                          <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isMe ? "end" : "start"} className="w-40 text-xs">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2"
                          onClick={() => navigator.clipboard.writeText(text)}
                        >
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>Copy</span>
                        </DropdownMenuItem>
                        {isMe && onDeleteMessage && (
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                            onClick={() => onDeleteMessage(id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}

        <div ref={bottomAnchorRef} className="h-px" />
      </div>

      {!isAtBottom && (
        <div className="absolute bottom-3 right-4 z-10 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={scrollToBottom}
                  size="icon"
                  className="h-9 w-9 rounded-full bg-background border border-border shadow-md hover:bg-muted text-foreground relative"
                  aria-label="Scroll to latest messages"
                >
                  <ArrowDown className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-2xs">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                Jump to latest
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
};

export default MessageArea;