import type { FormattedMessage } from "@/types/chat";
import socket from "@/lib/socket";
import { useEffect, useState } from "react";

export const useChatSocket = (chatId?: string, user?: any) => {
  const [liveMessages, setLiveMessages] = useState<FormattedMessage[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    setLiveMessages([]);
  }, [chatId]);

  // 4. Socket Listeners
  useEffect(() => {
    if (!chatId || !user) return;

    socket.emit("join-chat", chatId);

    const handleMessage = (newMessage: any) => {
      const incomingSenderId = newMessage.senderId?._id || newMessage.senderId;

      setLiveMessages((prev) => [
        ...prev,
        {
          id: newMessage._id,
          text: newMessage.content,
          time: new Date(newMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isMe: incomingSenderId === user._id,
          sender: incomingSenderId,
        },
      ]);
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
