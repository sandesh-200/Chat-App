import type { Chat } from "@/components/layout/Sidebar";
import api from "./axios_config";

export const getUsersChat = async (page: number = 1) => {
  try {
    const { data } = await api.get(`/chats?page=${page}&limit=10`);
    return data; // This returns the { data: [], pagination: {} } object
  } catch (error) {
    console.error("Error fetching chats:", error);
    throw error;
  }
};

export const getChat = async (chatId: string): Promise<Chat> => {
  try {
    const response = await api.get(`/chats/${chatId}`);
    return response.data.chat;
  } catch (error) {
    console.error("Error fetching chat:", error);
    throw error;
  }
};

export async function createPersonalChat(userId: string) {
  try {
    const response = await api.post("/chats/personal", { userId });

    if (response.data.chat) {
      return response.data;
    }

    return null;
  } catch (error: any) {
    if (error.response?.data?.message) {
      console.error(
        "Error creating personal chat:",
        error.response.data.message,
      );
      return { error: error.response.data.message };
    } else {
      console.error("Unexpected error:", error);
      return { error: "Something went wrong" };
    }
  }
}

export interface CreateGroupPayload {
  groupName: string;
  participants: string[];
}

export const createGroupChat = async (payload: CreateGroupPayload) => {
  const response = await api.post("/chats/group", payload);
  return response.data;
};
