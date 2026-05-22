import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { PlusIcon, Search, Users, Pen } from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardTitle } from "../ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { ScrollArea } from "../ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { ChatCreateModal } from "../personalChatCreateModal";
import { GroupCreateModal } from "../groupChatCreateModal";
import { useAuth } from "@/context/AuthContext";
import { useSidebarData } from "@/hooks/useSidebarData";
import ChatItem from "../chat_window/ChatItem";

const Sidebar = () => {
  const { chatId: activeChatId } = useParams();
  const { user } = useAuth();
  const { ref, inView } = useInView();

  const {
    chats,
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

  return (
    <Card className="w-full h-full rounded-none flex flex-col border-none shadow-none">
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

      {/* Search */}
      <div className="px-4 mb-4">
        <InputGroup className="bg-muted/50 border-none rounded-lg overflow-hidden">
          <InputGroupAddon>
            <Search className="text-muted-foreground ml-3 h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search chats..."
            className="border-none focus-visible:ring-0"
          />
        </InputGroup>
      </div>

      {/* List Area */}
      <ScrollArea className="flex-1 w-full rounded-none">
        <div className="flex flex-col">
          {isLoading && (
            <div className="p-4 text-center text-xs text-muted-foreground">
              Loading chats...
            </div>
          )}
          {error && (
            <div className="p-4 text-center text-sm text-red-500">
              Error loading chats
            </div>
          )}

          {chats.map((chat) => (
            <ChatItem
              key={chat._id}
              chat={chat}
              currentUserId={user?._id}
              isActive={activeChatId === chat._id}
            />
          ))}

          {/* Sentinel for Infinite Scroll */}
          <div ref={ref} className="p-6 flex justify-center items-center">
            {isFetchingNextPage ? (
              <div className="animate-pulse text-xs text-muted-foreground">
                Loading more...
              </div>
            ) : (
              !hasNextPage &&
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
