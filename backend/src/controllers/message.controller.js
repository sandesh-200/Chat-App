import { format } from "date-fns";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const loggedInUserId = req.user._id;

    const rawMessages = await Message.find({ conversationId: chatId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("senderId", "fullName avatar");

    const formattedMessages = rawMessages.reverse().map((msg) => ({
      id: msg._id,
      sender: msg.senderId.fullName,
      text: msg.content,
      time: format(new Date(msg.createdAt), "hh:mm aa"),
      isMe: msg.senderId._id.toString() === loggedInUserId.toString(),
    }));

    res.status(200).json(formattedMessages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.senderId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await Message.findByIdAndDelete(messageId);

    const latestMessage = await Message.findOne({
      conversationId: message.conversationId,
    }).sort({ createdAt: -1 });

    await Chat.findByIdAndUpdate(message.conversationId, {
      lastMessage: latestMessage?._id || null,
    });

    return res.json({
      success: true,
      message: "Message deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
};
