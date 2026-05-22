import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Check } from "lucide-react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Separator } from "../ui/separator";
import type { Chat } from "../../types/chat";

interface ChatItemProps {
  chat: Chat;
  currentUserId?: string;
  isActive: boolean;
}

const ChatItem = ({ chat, currentUserId, isActive }: ChatItemProps) => {
  const partner =
    chat.type === "personal"
      ? chat.participants.find((p) => p._id !== currentUserId)
      : null;

  const displayName =
    chat.type === "group" ? chat.groupName : partner?.fullName || "User";

  const isOnline = chat.type === "personal" && partner?.status === "online";

  const relativeTime = formatDistanceToNow(new Date(chat.updatedAt), {
    addSuffix: true,
  });

  return (
    <React.Fragment>
      <Link to={`/chats/${chat._id}`}>
        <div
          className={`flex items-center gap-4 px-4 py-4 transition-colors cursor-pointer group ${
            isActive ? "bg-secondary" : "hover:bg-secondary/80"
          }`}
        >
          <div className="relative">
            <Avatar className="h-12 w-12 shrink-0 border">
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-semibold text-sm truncate">{displayName}</h3>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
                {relativeTime}
              </span>
            </div>
            <div className="flex items-center gap-1 min-w-0">
              <Check className="h-3 w-3 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground truncate leading-tight">
                {chat.lastMessage?.content || "No messages yet"}
              </p>
            </div>
          </div>
        </div>
      </Link>
      <Separator className="mx-4 w-auto opacity-50" />
    </React.Fragment>
  );
};

export default ChatItem;
