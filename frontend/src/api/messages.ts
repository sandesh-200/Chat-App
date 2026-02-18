import api from "./axios_config";

// export interface FormattedMessage {
//   id: string;
//   sender: string;
//   text: string;
//   time: string;
//   isMe: boolean;
// }

export interface FormattedMessage {
  id: string;
  sender:
    | {
        _id: string;
        fullName: string;
      }
    | string; // Allow both for flexibility
  text: string;
  time: string;
  isMe: boolean;
}

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
