import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Users, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import type { Chat } from "../../types/chat";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { deleteConversation } from "@/api/chats";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface ChatItemProps {
  chat: Chat;
  currentUserId?: string;
  isActive: boolean;
}

const ChatItem = ({ chat, currentUserId, isActive }: ChatItemProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Type discriminant partner lookup
  const partner =
    chat.type === "personal"
      ? chat.participants.find((p) => p._id !== currentUserId)
      : null;

  const displayName =
    chat.type === "group" ? chat.groupName : partner?.fullName || "User";

  const isOnline = chat.type === "personal" && partner?.status === "online";

  const isUnread =
    !!chat.lastMessage &&
    !!currentUserId &&
    chat.lastMessage.senderId !== currentUserId &&
    !(chat.lastMessage.readBy || []).includes(currentUserId);

  // Time formatting prioritizing scanability
  const formattedTime = useMemo(() => {
    if (!chat.lastMessage?.createdAt && !chat.updatedAt) return "";
    const date = new Date(chat.lastMessage?.createdAt || chat.updatedAt);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }

    return date.toLocaleDateString([], { month: "numeric", day: "numeric" });
  }, [chat.lastMessage?.createdAt, chat.updatedAt]);

  const handleDeleteConversation = async () => {
    try {
      await deleteConversation(chat._id);

      queryClient.setQueryData(["chats"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.filter((c: Chat) => c._id !== chat._id),
          })),
        };
      });

      if (isActive) {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="relative group/row">
          <Link
            to={`/chats/${chat._id}`}
            role="listitem"
            aria-selected={isActive}
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 outline-none cursor-pointer select-none",
              // Keyboard focus
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-sidebar",
              // Default state
              "text-muted-foreground hover:text-foreground",
              // Hover state
              "hover:bg-sidebar-accent/50 active:bg-sidebar-accent/80",
              // Active / Selected state
              isActive && [
                "bg-sidebar-accent text-sidebar-foreground font-medium",
                "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:rounded-r-full before:bg-primary"
              ]
            )}
          >
            {/* Avatar & Presence */}
            <div className="relative shrink-0">
              <Avatar className={cn(
                "h-9 w-9 transition-transform duration-150 border border-border/40",
                isActive ? "scale-100 border-border/60" : "group-hover/row:scale-[1.02]"
              )}>
                <AvatarFallback className={cn(
                  "text-xs font-semibold tracking-tight transition-colors",
                  chat.type === "group"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary/10 text-primary"
                )}>
                  {chat.type === "group" ? (
                    <Users className="h-4 w-4 opacity-80" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </AvatarFallback>
              </Avatar>

              {/* Presence dot */}
              {isOnline && (
                <span 
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-sidebar"
                  title="Online"
                />
              )}
            </div>

            {/* Conversation Information */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              {/* Name & Time */}
              <div className="flex items-center justify-between gap-1.5">
                <span
                  className={cn(
                    "text-xs truncate tracking-tight transition-colors leading-snug",
                    isUnread
                      ? "font-semibold text-foreground"
                      : isActive
                      ? "font-semibold text-sidebar-foreground"
                      : "font-medium text-sidebar-foreground/90 group-hover/row:text-foreground"
                  )}
                >
                  {displayName}
                </span>

                {formattedTime && (
                  <time
                    dateTime={chat.lastMessage?.createdAt || chat.updatedAt}
                    className={cn(
                      "text-[10px] shrink-0 font-mono tracking-tight transition-colors",
                      isUnread
                        ? "font-semibold text-primary"
                        : "text-muted-foreground/70 group-hover/row:text-muted-foreground"
                    )}
                  >
                    {formattedTime}
                  </time>
                )}
              </div>

              {/* Message Preview & Unread Signal */}
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "text-[11px] truncate leading-tight transition-colors",
                    isUnread
                      ? "font-medium text-foreground"
                      : "text-muted-foreground/80 group-hover/row:text-muted-foreground"
                  )}
                >
                  {chat.lastMessage?.content ? (
                    chat.lastMessage.content
                  ) : (
                    <span className="italic opacity-60">No messages yet</span>
                  )}
                </p>

                {/* Integrated Unread Signal */}
                {isUnread && (
                  <span className="shrink-0 flex items-center justify-center">
                    <span className="h-2 w-2 rounded-full bg-primary ring-2 ring-primary/20" />
                  </span>
                )}
              </div>
            </div>

            {/* Quick Action Trigger (revealed on hover/focus) */}
            <div 
              className="absolute right-2 opacity-0 group-hover/row:opacity-100 focus-within:opacity-100 transition-opacity duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/80"
                    aria-label="Conversation actions"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 shadow-md border-border/50">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive focus:bg-destructive/10 text-xs cursor-pointer"
                    onClick={handleDeleteConversation}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Link>
        </div>
      </ContextMenuTrigger>

      {/* Context Menu (Right Click) */}
      <ContextMenuContent className="w-48 shadow-md border-border/50">
        <ContextMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10 text-xs cursor-pointer"
          onClick={handleDeleteConversation}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete Conversation
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default ChatItem;