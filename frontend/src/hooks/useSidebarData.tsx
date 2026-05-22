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
    socket.on("user-status-changed", ({ userId, status }) => {
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
    });

    return () => {
      socket.off("user-status-changed");
    };
  }, [queryClient]);

  const chats = query.data?.pages.flatMap((page) => page.data) ?? [];

  return { ...query, chats };
};
