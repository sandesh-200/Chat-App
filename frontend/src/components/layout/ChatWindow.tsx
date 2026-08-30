import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import { MessageSquarePlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { useChatData } from "@/hooks/useChatData";
import { useChatSocket } from "@/hooks/useChatSocket";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { deleteMessage } from "@/api/messages";

// Modular UI Components
import ChatHeader from "../chat_window/ChatHeader";
import MessageArea from "../chat_window/MessageArea";
import ChatInput from "../chat_window/ChatInput";
import { Skeleton } from "@/components/ui/skeleton";

// --- Sub-Components ---

/** Empty Workspace Placeholder when no chat is selected in params */
const NoChatSelectedWorkspace = () => (
  <main
    role="main"
    aria-label="No conversation selected"
    className="flex-1 hidden md:flex flex-col items-center justify-center bg-background p-8 text-center select-none"
  >
    <div className="relative mb-5">
      <div className="absolute -inset-2 rounded-full bg-primary/10 blur-xl animate-pulse" />
      <div className="relative bg-muted/60 dark:bg-muted/30 border border-border/40 rounded-full p-5 shadow-2xs">
        <MessageSquarePlus className="h-10 w-10 text-primary" />
      </div>
    </div>
    <h2 className="text-xl font-semibold tracking-tight text-foreground mb-1.5">
      Your messages will appear here
    </h2>
    <p className="text-muted-foreground max-w-[320px] text-xs leading-relaxed">
      Select a conversation from the sidebar to start messaging, share files, and view history.
    </p>
  </main>
);

/** Preserves structural geometry during chat metadata & history fetch */
const WorkspaceLoadingSkeleton = () => (
  <div className="flex flex-col h-full w-full bg-background min-h-0">
    {/* Stable Header Skeleton */}
    <div className="h-16 px-4 border-b border-border/40 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>

    {/* Message Area Delegates internal skeleton loading */}
    <MessageArea messages={[]} isLoading={true} />

    {/* Stable Disabled Composer Skeleton */}
    <div className="p-3 border-t border-border/40 shrink-0 bg-background/50">
      <Skeleton className="h-11 w-full rounded-2xl" />
    </div>
  </div>
);

// --- Main ChatWindow Composition Workspace ---

const ChatWindow: React.FC = () => {
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

  // Combine historical and live messages safely
  const allMessages = useMemo(
    () => [...(messages || []), ...liveMessages],
    [messages, liveMessages]
  );

  // Derive Chat Header Details
  const chatDetails = useMemo(() => {
    if (!chatData || !user) {
      return { name: "Conversation", initial: "C", status: "offline" as const };
    }

    if (chatData.type === "personal") {
      const partner = chatData.participants?.find(
        (p: any) => p._id !== user._id
      );
      return {
        name: partner?.fullName || "User",
        initial: partner?.fullName?.charAt(0).toUpperCase() || "U",
        status: (partner?.status || "offline") as "online" | "offline",
      };
    }

    return {
      name: chatData.groupName || "Group Chat",
      initial: chatData.groupName?.charAt(0).toUpperCase() || "G",
      status: "online" as const,
    };
  }, [chatData, user]);

  // Optimized Deletion Handling
  const handleDeleteMessage = async (messageId: string) => {
    try {
      setLiveMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      queryClient.setQueryData(["messages", chatId], (old: any[] = []) =>
        old.filter((msg) => msg.id !== messageId)
      );

      await deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // --- Early Render Boundaries ---

  if (!chatId) {
    return <NoChatSelectedWorkspace />;
  }

  if (isLoading) {
    return <WorkspaceLoadingSkeleton />;
  }

  return (
    <main
      role="main"
      aria-label={`Conversation with ${chatDetails.name}`}
      className="flex flex-col h-dvh sm:h-full w-full bg-background min-h-0 overflow-hidden select-none sm:select-text"
    >
      {/* Fixed Chat Header Boundary */}
      <header className="shrink-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <ChatHeader
          name={chatDetails.name}
          initial={chatDetails.initial}
          status={chatDetails.status}
        />
      </header>

      {/* Flexible & Scrollable Conversation Area */}
      <section
        aria-label="Message history"
        className="flex-1 min-h-0 flex flex-col relative bg-background/50"
      >
        <MessageArea
          messages={allMessages}
          isLoading={false}
          onDeleteMessage={handleDeleteMessage}
          isGroupChat={chatData?.type === "group"}
        />
      </section>

      {/* Fixed Message Composer Surface */}
      <footer className="shrink-0 z-10 border-t border-border/40 bg-background/95 backdrop-blur-sm">
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
      </footer>
    </main>
  );
};

export default ChatWindow;