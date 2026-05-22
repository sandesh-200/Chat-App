import { getChat } from "@/api/chats";
import { getChatMessages, type FormattedMessage } from "@/api/messages";
import type { Chat } from "@/components/layout/Sidebar";
import { useQuery } from "@tanstack/react-query";

export const useChatData = (chatId?: string) => {
  const { data: chatData, isLoading: isChatLoading } = useQuery<Chat>({
    queryKey: ["chatData", chatId],
    queryFn: () => getChat(chatId!),
    enabled: !!chatId,
  });

  const { data: messages, isLoading: isMessagesLoading } = useQuery<
    FormattedMessage[]
  >({
    queryKey: ["messages", chatId],
    queryFn: () => getChatMessages(chatId!),
    enabled: !!chatId,
    refetchOnWindowFocus: false,
  });

  return { chatData, messages, isLoading: isChatLoading || isMessagesLoading };
};
