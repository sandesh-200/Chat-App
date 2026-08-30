import type { FormattedMessage } from "@/types/chat";
import socket from "@/lib/socket";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const useChatSocket = (chatId?: string, user?: any) => {
  const [liveMessages, setLiveMessages] = useState<FormattedMessage[]>([]);
  const [text, setText] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    setLiveMessages([]);
  }, [chatId]);

  // 4. Socket Listeners
  useEffect(() => {
    if (!chatId || !user) return;

    socket.emit("join-chat", chatId);
    socket.emit("mark-read", { conversationId: chatId });

    // Optimistically mark the chat as read in the sidebar
    queryClient.setQueryData(["chats"], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: any) => ({
          ...page,
          data: page.data.map((chat: any) => {
            if (chat._id === chatId && chat.lastMessage) {
              return {
                ...chat,
                lastMessage: {
                  ...chat.lastMessage,
                  readBy: [...(chat.lastMessage.readBy || []), user._id]
                }
              };
            }
            return chat;
          })
        }))
      };
    });

    const handleMessage = (newMessage: any) => {
      // ONLY append to live messages if it belongs to the currently active chat window
      if (newMessage.conversationId !== chatId) return;
      
      socket.emit("mark-read", { conversationId: chatId });

      const sender = newMessage.sender;

      setLiveMessages((prev) => {
        const exists = prev.some((m) => m.id === newMessage._id);
        if (exists) return prev;

        return [
          ...prev,
          {
            id: newMessage._id,
            text: newMessage.content,
            time: new Date(newMessage.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isMe: sender?._id === user._id,
            sender: {
              _id: sender?._id || "unknown",
              fullName: sender?.fullName || "Unknown User",
            },
          },
        ];
      });
    };

    socket.on("receive-message", handleMessage);  
    return () => {
      socket.off("receive-message", handleMessage);
    };
  }, [chatId, user?._id]);


  const sendMessage = (text: string) => {
    if (!text.trim() || !chatId) return;

    socket.emit("send-message", {
      conversationId: chatId,
      content: text,
      type: "text",
    });

    setText("");
  };

  return {
    liveMessages,
    setLiveMessages,
    sendMessage,
    text,
    setText,
  };
};
