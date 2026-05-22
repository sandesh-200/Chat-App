export interface Participant {
  _id: string;
  fullName: string;
  status?: "online" | "offline";
}

export interface LastMessage {
  _id: string;
  content: string;
  type: string;
  senderId: string;
  createdAt: string;
}

interface BaseChat {
  _id: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  type: "personal" | "group";
  createdAt: string;
  updatedAt: string;
}

interface PersonalChat extends BaseChat {
  type: "personal";
}

interface GroupChat extends BaseChat {
  type: "group";
  groupName: string;
  groupAdmin: string;
}

export type Chat = PersonalChat | GroupChat;

export interface ChatApiResponse {
  data: Chat[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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

export interface MessageAreaProps {
  messages: FormattedMessage[];
  isLoading: boolean;
  onDeleteMessage: (messageId: string) => void;
}

export interface CreateGroupPayload {
  groupName: string;
  participants: string[];
}
