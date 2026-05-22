import { getChat } from "@/api/chats";
import { getChatMessages } from "@/api/messages";
import type { FormattedMessage } from "@/types/chat";
import type { Chat } from "@/types/chat";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export const useChatData = (chatId?: string) => {
  const { user } = useAuth();

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

  return {
    chatData,
    messages,
    isLoading: isChatLoading || isMessagesLoading,
  };
};
