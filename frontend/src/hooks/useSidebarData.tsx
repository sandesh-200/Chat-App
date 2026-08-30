import { useEffect } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getUsersChat } from "@/api/chats";
import socket from "@/lib/socket";
import type { ChatApiResponse, Chat } from "../types/chat";

export const useSidebarData = () => {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery<ChatApiResponse>({
    queryKey: ["chats"],
    queryFn: ({ pageParam = 1 }) => getUsersChat(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
  useEffect(() => {
    const handleStatusChange = ({ userId, status }: { userId: string, status: string }) => {
      queryClient.setQueryData(["chats"], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((chat: Chat) => {
              const updatedParticipants = chat.participants.map((p) =>
                p._id === userId ? { ...p, status } : p,
              );
              return { ...chat, participants: updatedParticipants };
            }),
          })),
        };
      });
    };
    socket.on("user-status-changed", handleStatusChange);

    // Add listener for new messages to dynamically update the sidebar list
    const handleReceiveMessage = (newMessage: any) => {
      queryClient.setQueryData(["chats"], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => {
            const updatedData = page.data.map((chat: Chat) => {
              if (chat._id === newMessage.conversationId) {
                return {
                  ...chat,
                  lastMessage: {
                    content: newMessage.content,
                    type: newMessage.type || "text",
                    createdAt: newMessage.createdAt,
                    senderId: newMessage.sender._id
                  },
                  updatedAt: new Date().toISOString()
                };
              }
              return chat;
            });

            // Sort so the chat with the most recent message bubbles to the top
            updatedData.sort((a: Chat, b: Chat) => 
              new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
            );

            return { ...page, data: updatedData };
          }),
        };
      });
    };
    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("user-status-changed", handleStatusChange);
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [queryClient]);


  const chats = query.data?.pages.flatMap((page) => page.data) ?? [];

  return { ...query, chats };
};
