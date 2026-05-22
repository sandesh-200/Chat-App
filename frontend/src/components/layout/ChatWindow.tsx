import { useParams } from "react-router-dom";
import { Loader2, MessageSquarePlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Custom Hooks
import { useChatData } from "@/hooks/useChatData";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useAISuggestions } from "@/hooks/useAISuggestions";

// Modular UI Components
import ChatHeader from "../chat_window/ChatHeader";
import MessageArea from "../chat_window/MessageArea";
import ChatInput from "../chat_window/ChatInput";
import { deleteMessage } from "@/api/messages";
import { useQueryClient } from "@tanstack/react-query";

const ChatWindow = () => {
  const { user } = useAuth();
  const { chatId } = useParams<{ chatId: string }>();
  const queryClient = useQueryClient();

  // 1. Fetch Chat Metadata & History
  const { chatData, messages, isLoading } = useChatData(chatId);

  // 2. Real-time Sockets & Text Input State
  const { liveMessages, setLiveMessages, sendMessage, text, setText } =
    useChatSocket(chatId, user);

  // 3. AI Smart Replies
  const {
    suggestions,
    loading: aiLoading,
    show: showAI,
    setShow: setShowAI,
    fetchSuggestions,
  } = useAISuggestions(chatId);

  // Combine historical and live messages
  const allMessages = [...(messages || []), ...liveMessages].filter(
    (msg, index, self) => index === self.findIndex((m) => m.id === msg.id),
  );

  // Helper to resolve Header display info
  const getChatDetails = () => {
    if (!chatData || !user)
      return { name: "Chat", initial: "C", status: "offline" };

    if (chatData.type === "personal") {
      const partner = chatData.participants?.find(
        (p: any) => p._id !== user._id,
      );
      return {
        name: partner?.fullName || "User",
        initial: partner?.fullName?.charAt(0).toUpperCase() || "U",
        status: partner?.status || "offline",
      };
    }
    return { name: chatData.groupName, initial: "G", status: "online" };
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setLiveMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      queryClient.setQueryData(["messages", chatId], (old: any[] = []) =>
        old.filter((msg) => msg.id !== messageId),
      );

      await deleteMessage(messageId);
    } catch (error) {
      console.log(error);
    }
  };

  const { name, initial, status } = getChatDetails();
  // --- Early Returns for Loading/Empty States ---

  if (!chatId) {
    return (
      <div className="flex-1 md:flex flex-col hidden items-center justify-center bg-background p-8 text-center">
        <div className="relative mb-6">
          <div className="absolute -inset-1 rounded-full bg-primary/20 blur-xl animate-pulse" />
          <div className="relative bg-secondary rounded-full p-6">
            <MessageSquarePlus className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Your messages will appear here
        </h2>
        <p className="text-muted-foreground max-w-[280px] text-sm mb-6">
          Select a conversation from the sidebar to begin connecting with
          others.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-background gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading conversation...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-background border-l">
      <ChatHeader name={name} initial={initial} status={status} />

      {/* Clean: No refs passed, no scroll logic here */}
      <MessageArea
        messages={allMessages}
        isLoading={isLoading}
        onDeleteMessage={handleDeleteMessage}
      />

      <ChatInput
        text={text}
        setText={setText}
        onSendMessage={() => sendMessage(text)}
        ai={{
          suggestions,
          loading: aiLoading,
          show: showAI,
          setShow: setShowAI,
          fetch: fetchSuggestions,
        }}
      />
    </div>
  );
};

export default ChatWindow;
