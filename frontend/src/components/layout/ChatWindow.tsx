import { MoreHorizontal, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getChat } from "@/api/chats";
import type { Chat } from "./Sidebar";
import { getChatMessages, type FormattedMessage } from "@/api/messages";

const ChatWindow = () => {
  const { chatId } = useParams<{ chatId: string }>();

  const {
    data: chatData,
    isLoading: isChatLoading,
  } = useQuery<Chat>({
    queryKey: ["chatData", chatId],
    queryFn: () => getChat(chatId!),
    enabled: !!chatId,
  });

  const { data: messages, isLoading: isMessagesLoading } = useQuery<FormattedMessage[]>({
    queryKey: ["messages", chatId],
    queryFn: () => getChatMessages(chatId!),
    enabled: !!chatId,
    refetchOnWindowFocus: false,
  });

  const getChatDetails = () => {
    if (!chatData) return { name: "Chat", initial: "C" };
    if (chatData.type === "personal") {
      const name = chatData.participants?.[1]?.fullName || "User";
      return { name, initial: name.charAt(0).toUpperCase() };
    }
    const groupName = (chatData as any).groupName || "Group";
    return { name: groupName, initial: groupName.charAt(0).toUpperCase() };
  };

  const { name, initial } = getChatDetails();

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground">
        <p className="text-lg font-medium">Select a chat to start messaging</p>
      </div>
    );
  }

if (isChatLoading) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background gap-3">
      <div className="flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
          Loading conversation...
        </p>
      </div>
    </div>
  );
}

  return (
    <div className="flex flex-col h-full w-full bg-background border-l">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src="" /> 
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {initial}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">{name}</h2>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 relative">
        {/* 3. Centered "Messages Only" loading state */}
        {isMessagesLoading ? (
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Fetching messages...</span>
              </div>
           </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages?.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-2 mb-1 group">
                  {!msg.isMe && (
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" />
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.isMe
                        ? "bg-accent text-accent-foreground rounded-tr-none"
                        : "bg-secondary/50 text-foreground rounded-tl-none border"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.isMe && (
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity" />
                  )}
                </div>
                <div className="flex items-center gap-1 px-1">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {msg.time}
                  </span>
                  {msg.isMe && <span className="text-green-500 text-[10px]">✓✓</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Footer */}
      <footer className="p-4 bg-background border-t">
        <div className="flex items-center gap-2 border rounded-xl p-2 bg-muted/30">
          <Input
            placeholder="Enter message..."
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button size="sm" className="ml-2 h-9 px-4">
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;