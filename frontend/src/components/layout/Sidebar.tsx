import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { formatDistanceToNow } from "date-fns";
import { PlusIcon, Search, Check, Users, Pen } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { ChatCreateModal } from "../personalChatCreateModal";
import { GroupCreateModal } from "../groupChatCreateModal";
import { getUsersChat } from "@/api/chats";
import { useAuth } from "@/context/AuthContext";
import socket from "@/lib/socket";

export interface Participant {
  _id: string;
  fullName: string;
  status?: "online" | "offline";
}

export interface LastMessage {
  _id: string;
  content: string;
  type: string;
  senderId: string;
  createdAt: string;
}

interface BaseChat {
  _id: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  type: "personal" | "group";
  createdAt: string;
  updatedAt: string;
}

interface PersonalChat extends BaseChat {
  type: "personal";
}

interface GroupChat extends BaseChat {
  type: "group";
  groupName: string;
  groupAdmin: string;
}

export type Chat = PersonalChat | GroupChat;

interface ChatApiResponse {
  data: Chat[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// --- Component ---
const Sidebar = () => {
  const queryClient = useQueryClient();
  const { chatId: activeChatId } = useParams();
  const { user } = useAuth();
  const { ref, inView } = useInView();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<ChatApiResponse>({
    queryKey: ["chats"],
    queryFn: ({ pageParam = 1 }) => getUsersChat(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });

  // Inside Sidebar component
  useEffect(() => {
    socket.on("user-status-changed", ({ userId, status }) => {
      // We update the Query Client cache so the UI reflects the change immediately
      queryClient.setQueryData(["chats"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((chat: Chat) => {
              // Update the status of the specific participant in the chat object
              const updatedParticipants = chat.participants.map((p) =>
                p._id === userId ? { ...p, status } : p,
              );
              return { ...chat, participants: updatedParticipants };
            }),
          })),
        };
      });
    });

    return () => {
      socket.off("user-status-changed");
    };
  }, []);

  // Trigger load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten nested pages into one array
  const chats = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <Card className="w-full md:w-[30%] h-screen rounded-none flex flex-col border-none shadow-none">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3">
        <CardTitle className="text-3xl font-bold">Chats</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="rounded-full h-11 w-11 shadow-sm p-0">
              <PlusIcon className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="border-none w-48" align="end">
            <DropdownMenuGroup className="flex flex-col gap-1">
              <ChatCreateModal>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Pen className="mr-2 h-4 w-4" /> New Chat
                </DropdownMenuItem>
              </ChatCreateModal>
              <GroupCreateModal>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Users className="mr-2 h-4 w-4" /> Group Chat
                </DropdownMenuItem>
              </GroupCreateModal>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <InputGroup className="bg-muted/50 border-none rounded-lg overflow-hidden">
          <InputGroupAddon>
            <Search className="text-muted-foreground ml-3 h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search chats..."
            className="placeholder:text-muted-foreground/70 border-none focus-visible:ring-0"
          />
        </InputGroup>
      </div>

      {/* Chat List Area */}
      <ScrollArea className="flex-1 w-full rounded-none">
        <div className="flex flex-col">
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading chats...
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-sm text-red-500">
              Error loading chats
            </div>
          )}

          {chats.map((chat) => {
            const relativeTime = formatDistanceToNow(new Date(chat.updatedAt), {
              addSuffix: true,
            });

            // --- NEW LOGIC START ---
            let displayName = "Chat";

            if (chat.type === "group") {
              displayName = chat.groupName;
            } else {
              const partner = chat.participants.find(
                (p) => p._id !== user?._id,
              );
              displayName = partner?.fullName || "User";
            }
            const partner =
              chat.type === "personal"
                ? chat.participants.find((p) => p._id !== user?._id)
                : null;
            const isOnline =
              chat.type === "personal" && partner?.status === "online";

            return (
              <React.Fragment key={chat._id}>
                <Link to={`/chats/${chat._id}`}>
                  <div
                    className={`flex items-center gap-4 px-4 py-4 transition-colors cursor-pointer group ${
                      activeChatId === chat._id
                        ? "bg-secondary" // Active style
                        : "hover:bg-secondary/80" // Hover style
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-12 w-12 shrink-0 border">
                        <AvatarFallback>
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* 🟢 Show green dot only if user is online and it's a personal chat */}
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-sm truncate">
                          {displayName}
                        </h3>
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap ml-2">
                          {relativeTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 min-w-0">
                          <Check className="h-3 w-3 text-muted-foreground shrink-0" />
                          <p className="text-sm text-muted-foreground truncate leading-tight">
                            {chat.lastMessage?.content || "No messages yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
                <Separator className="mx-4 w-auto opacity-50" />
              </React.Fragment>
            );
          })}

          {/* Sentinel element for infinite scroll */}
          <div ref={ref} className="p-6 flex justify-center items-center">
            {isFetchingNextPage ? (
              <div className="animate-pulse text-xs text-muted-foreground">
                Loading more...
              </div>
            ) : hasNextPage ? (
              <div className="h-1" />
            ) : (
              chats.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  End of conversations
                </span>
              )
            )}
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
};

export default Sidebar;
