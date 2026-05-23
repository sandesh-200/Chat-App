import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { PlusIcon, Search, Users, Pen, LogOut } from "lucide-react";

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
import { logoutUser } from "@/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback } from "../ui/avatar";

const Sidebar = () => {
  const queryClient = useQueryClient();
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


      <Separator className="opacity-50" />
      <div className="p-3 flex items-center justify-between bg-muted/20">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full p-2 hover:bg-secondary/80 rounded-lg transition-colors text-left outline-none">
              <Avatar className="h-9 w-9 border shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-none mb-1">
                  {user?.fullName || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate leading-none">
                  {user?.email || ""}
                </p>
              </div>
              <LogOut className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-none" align="end" side="top">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onSelect={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};

export default Sidebar;
