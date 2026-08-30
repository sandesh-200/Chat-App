import { getChat } from "@/api/chats";
import { getChatMessages } from "@/api/messages";
import type { FormattedMessage } from "@/types/chat";
import type { Chat } from "@/types/chat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import socket from "@/lib/socket";

export const useChatData = (chatId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: chatData, isLoading: isChatLoading } = useQuery<Chat>({
    queryKey: ["chatData", chatId],
    queryFn: () => getChat(chatId!),
    enabled: !!chatId,
  });

  const { data: messages, isLoading: isMessagesLoading } = useQuery<
    FormattedMessage[]
  >({
    queryKey: ["messages", chatId],
    queryFn: async () => {
      const res = await getChatMessages(chatId!);

      // 🔥 NORMALIZATION HAPPENS HERE
      return res.map((msg: any) => ({
        id: msg._id,
        text: msg.content,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),

        isMe: msg.senderId?._id === user?._id,

        sender: {
          _id: msg.senderId?._id,
          fullName: msg.senderId?.fullName || "Unknown User",
        },
      }));
    },
    enabled: !!chatId && !!user,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!chatId) return;
    const handleStatusChange = ({ userId, status }: { userId: string, status: "online" | "offline" }) => {
      queryClient.setQueryData<Chat>(["chatData", chatId], (oldData) => {
        if (!oldData) return oldData;
        const updatedParticipants = oldData.participants?.map(p => 
          p._id === userId ? { ...p, status } : p
        );
        return { ...oldData, participants: updatedParticipants } as Chat;
      });
    };

    socket.on("user-status-changed", handleStatusChange);
    return () => {
      socket.off("user-status-changed", handleStatusChange);
    };
  }, [chatId, queryClient]);

  return {
    chatData,
    messages,
    isLoading: isChatLoading || isMessagesLoading,
  };
};
