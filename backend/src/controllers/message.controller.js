import { format } from 'date-fns'
import Message from '../models/message.model.js';

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
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};