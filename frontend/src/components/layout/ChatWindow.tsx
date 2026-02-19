import { MoreHorizontal, Loader2, MessageSquarePlus, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getChat } from "@/api/chats";
import type { Chat } from "./Sidebar";
import { getChatMessages, type FormattedMessage } from "@/api/messages";
import socket from "@/lib/socket";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

const ChatWindow = () => {
  const { user } = useAuth();
  const { chatId } = useParams<{ chatId: string }>();
  const [text, setText] = useState("");
  const [liveMessages, setLiveMessages] = useState<FormattedMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Chat Metadata (Participants, Group Name, etc.)
  const { data: chatData, isLoading: isChatLoading } = useQuery<Chat>({
    queryKey: ["chatData", chatId],
    queryFn: () => getChat(chatId!),
    enabled: !!chatId,
  });

  // 2. Fetch Message History
  const { data: messages, isLoading: isMessagesLoading } = useQuery<FormattedMessage[]>({
    queryKey: ["messages", chatId],
    queryFn: () => getChatMessages(chatId!),
    enabled: !!chatId,
    refetchOnWindowFocus: false,
  });

  // 3. Clear live messages when switching chats to prevent "flicker"
  useEffect(() => {
    setLiveMessages([]);
  }, [chatId]);

  // 4. Socket Listeners
  useEffect(() => {
    if (!chatId || !user) return;

    socket.emit("join-chat", chatId);

    const handleMessage = (newMessage: any) => {
      const incomingSenderId = newMessage.senderId?._id || newMessage.senderId;
      if (incomingSenderId === user._id) return;

      setLiveMessages((prev) => [
        ...prev,
        {
          id: newMessage._id,
          text: newMessage.content,
          time: new Date(newMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: false,
          sender: incomingSenderId,
        },
      ]);
    };

    socket.on("receive-message", handleMessage);
    return () => {
      socket.off("receive-message", handleMessage);
    };
  }, [chatId, user?._id]);

  // 5. Combine data and Handle Auto-scroll
  const allMessages = [...(messages || []), ...liveMessages];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [allMessages]);


  if (!chatId) {
    return (
      <div className="flex-1 md:flex flex-col hidden items-center justify-center bg-background p-8 text-center">
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
          <div className="relative bg-secondary rounded-full p-6">
            <MessageSquarePlus className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Your messages will appear here</h2>
        <p className="text-muted-foreground max-w-[280px] text-sm mb-6">
          Select a conversation from the sidebar or start a new chat to begin connecting with others.
        </p>
      </div>
    );
  }

  // 7. Helper Logic for Header
  const getChatDetails = () => {
    if (!chatData || !user) return { name: "Chat", initial: "C", status: "offline" };

    if (chatData.type === "personal") {
      const partner = chatData.participants?.find((p: any) => p._id !== user._id);
      return {
        name: partner?.fullName || "User",
        initial: partner?.fullName?.charAt(0).toUpperCase() || "U",
        status: partner?.status || "offline",
      };
    }
    return { name: chatData.groupName, initial: "G", status: "online" };
  };

  const { name, initial, status } = getChatDetails();

  const handleSendMessage = () => {
    if (!text.trim() || !chatId || !user) return;

    socket.emit("send-message", {
      conversationId: chatId,
      content: text,
      type: "text",
    });

    setLiveMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
        sender: user._id,
      },
    ]);
    setText("");
  };

  if (isChatLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background border-l">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Link to="/" className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="relative">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            {status === "online" && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold">{name}</h2>
            <p className={`text-xs ${status === "online" ? "text-green-500" : "text-muted-foreground"}`}>
              {status === "online" ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 relative">
        {isMessagesLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Fetching messages...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {allMessages.map((msg, idx) => (
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
                  <span className="text-[10px] text-muted-foreground font-medium">{msg.time}</span>
                  {msg.isMe && <span className="text-green-500 text-[10px]">✓✓</span>}
                </div>
              </div>
            ))}
            {/* Scroll Anchor */}
            <div ref={scrollRef} className="h-0 w-0" />
          </div>
        )}
      </ScrollArea>

      {/* Input Footer */}
      <footer className="p-4 bg-background border-t">
        <div className="flex items-center gap-2 border rounded-xl p-2 bg-muted/30">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Enter message..."
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button size="sm" className="ml-2 h-9 px-4" onClick={handleSendMessage}>
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;