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
      _id: msg._id,
      content: msg.content,
      createdAt: msg.createdAt,
      senderId: {
        _id: msg.senderId._id,
        fullName: msg.senderId.fullName,
        avatar: msg.senderId.avatar,
      },
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
