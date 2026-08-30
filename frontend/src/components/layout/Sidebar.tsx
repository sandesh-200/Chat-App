import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { Search, Pen, LogOut, MessageSquarePlus, MessageSquareX } from "lucide-react";

import { Button } from "../ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,

  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { UnifiedChatModal } from "../UnifiedChatModal";
import { useAuth } from "@/context/AuthContext";
import { useSidebarData } from "@/hooks/useSidebarData";
import ChatItem from "../chat_window/ChatItem";
import { logoutUser } from "@/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import type { Chat } from "@/types/chat";

const Sidebar = () => {
  const queryClient = useQueryClient();
  const { chatId: activeChatId } = useParams();
  const { user } = useAuth();
  const { ref, inView } = useInView();

  const [searchQuery, setSearchQuery] = useState("");

  const {
    chats = [],
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSidebarData();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      queryClient.setQueryData(["authUser"], null);
      queryClient.clear();
      toast.success("Logged out successfully", { richColors: true });
    } catch (err) {
      toast.error("An error occurred during logout");
    }
  };

  // Filter conversations locally matching exact domain type discriminate logic
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const query = searchQuery.toLowerCase();

    return chats.filter((chat: Chat) => {
      if (chat.type === "group") {
        return chat.groupName.toLowerCase().includes(query);
      }
      const partner = chat.participants.find((p) => p._id !== user?._id);
      return partner?.fullName.toLowerCase().includes(query);
    });
  }, [chats, searchQuery, user?._id]);

  return (
    <aside className="w-full h-full flex flex-col bg-sidebar border-r border-sidebar-border/60 select-none overflow-hidden">
      {/* Sidebar Header */}
      <header className="px-3.5 pt-3.5 pb-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-semibold tracking-tight text-sidebar-foreground">
            Messages
          </h1>
          {chats.length > 0 && (
            <span className="text-[11px] font-medium text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded-full">
              {chats.length}
            </span>
          )}
        </div>

        <UnifiedChatModal>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            aria-label="New Message"
          >
            <Pen className="h-4 w-4" />
          </Button>
        </UnifiedChatModal>
      </header>

      {/* Search Bar */}
      <div className="px-3 pb-2 shrink-0">
        <InputGroup className="bg-muted/40 border border-transparent focus-within:border-ring/30 focus-within:bg-background rounded-md transition-all h-8">
          <InputGroupAddon className="pl-2.5 pr-1.5">
            <Search className="text-muted-foreground h-3.5 w-3.5" />
          </InputGroupAddon>
          <InputGroupInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="border-none text-xs focus-visible:ring-0 placeholder:text-muted-foreground/70 h-full"
          />
        </InputGroup>
      </div>

      <Separator className="bg-sidebar-border/50" />

      {/* Conversation List */}
      <ScrollArea className="flex-1 w-full">
        <div className="p-1.5 space-y-0.5" role="list">
          {/* Skeleton Loaders */}
          {isLoading && (
            <div className="space-y-1 p-1">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-md">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-2.5 w-8" />
                    </div>
                    <Skeleton className="h-2.5 w-36" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6 text-center text-xs text-destructive">
              Failed to load conversations. Please try again.
            </div>
          )}

          {/* Search Empty State */}
          {!isLoading && !error && filteredChats.length === 0 && searchQuery && (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <MessageSquareX className="h-8 w-8 text-muted-foreground/40 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-foreground">No chats found</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                No matching results for "{searchQuery}"
              </p>
            </div>
          )}

          {/* Empty Conversation List */}
          {!isLoading && !error && chats.length === 0 && !searchQuery && (
            <div className="p-8 text-center flex flex-col items-center justify-center">
              <MessageSquarePlus className="h-8 w-8 text-muted-foreground/40 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium text-foreground">No conversations yet</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Start a new chat to begin messaging
              </p>
            </div>
          )}

          {/* Items Rendering */}
          {!isLoading &&
            filteredChats.map((chat) => (
              <ChatItem
                key={chat._id}
                chat={chat}
                currentUserId={user?._id}
                isActive={activeChatId === chat._id}
              />
            ))}

          {/* Sentinel for Infinite Scroll */}
          <div ref={ref} className="py-2 flex justify-center items-center min-h-[24px]">
            {isFetchingNextPage && (
              <span className="text-[11px] text-muted-foreground/80 animate-pulse">
                Loading older chats...
              </span>
            )}
            {!hasNextPage && chats.length > 8 && !searchQuery && (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 py-2">
                End of list
              </span>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Footer User Profile */}
      <footer className="shrink-0 p-2 bg-sidebar border-t border-sidebar-border/60">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2.5 w-full p-1.5 hover:bg-sidebar-accent/70 active:bg-sidebar-accent rounded-md transition-colors text-left outline-none focus-visible:ring-1 focus-visible:ring-ring group"
              aria-label="User Account Options"
            >
              <Avatar className="h-8 w-8 border border-border/40 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate leading-tight group-hover:text-foreground">
                  {user?.fullName || "User"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight">
                  {user?.email || ""}
                </p>
              </div>
              <LogOut className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground shrink-0 ml-1 transition-colors" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 shadow-md border-border/50" align="end" side="top">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 text-xs cursor-pointer"
              onSelect={handleLogout}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </footer>
    </aside>
  );
};

export default Sidebar;