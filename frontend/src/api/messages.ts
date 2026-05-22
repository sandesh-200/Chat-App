import type { FormattedMessage } from "@/types/chat";
import api from "./axios_config";

export const getChatMessages = async (
  chatId: string,
): Promise<FormattedMessage[]> => {
  try {
    const response = await api.get(`/messages/${chatId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching chat messages", error);
    throw error;
  }
};

export const deleteMessage = async (messageId: string) => {
  try {
    const { data } = await api.delete(`/messages/${messageId}`);
    return data;
  } catch (error) {
    console.error("Error fetching chat messages", error);
    throw error;
  }
};
