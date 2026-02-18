import chatModel from "../models/chat.model.js";
import mongoose from "mongoose";
import { getPagination } from "../utils/getPagination.js";

export async function createPersonalChat(req, res) {
  try {
    const { userId } = req.body;
    const loggedInUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    if (userId === loggedInUserId.toString()) {
      return res.status(400).json({
        message: "Cannot create chat with yourself",
      });
    }

    let existingChat = await chatModel.findOne({
      type: "personal",
      participants: { $all: [loggedInUserId, userId] },
      
    });

    if (existingChat) {
      return res.status(200).json({
        message: "Personal chat already exists",
        chat: existingChat,
        isNew: false
      });
    }

    const newChat = await chatModel.create({
      type: "personal",
      participants: [loggedInUserId, userId],
    });

    res.status(201).json({
      message: "Personal chat created successfully",
      chat: newChat,
      isNew: true
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error creating personal chat",
      error: error.message,
    });
  }
}

export async function createGroupChat(req, res) {
  try {
    const {groupName, participants} = req.body;
    const creatorId = req.user._id;

    if (!groupName || !participants || !Array.isArray(participants)) {
      return res.status(400).json({ message: "Group name and participant IDs are required" });
    }

  const uniqueParticipants = [...new Set(participants.filter(id => id !== creatorId.toString()))];

  if (uniqueParticipants.length < 2) {
      return res.status(400).json({ message: "A group must have at least 3 members (including you)" });
    }

     const newGroup = await chatModel.create({
      type: "group",
      groupName,
      participants: [creatorId, ...uniqueParticipants],
      groupAdmin: creatorId,
    });

    res.status(201).json({
      message: "Group chat created successfully",
      chat: newGroup,
    });
    

  } catch (error) {
    return res.status(500).json({
      message: "Error creating group chat",
      error: error.message,
    });
  }}


export const getUserChats = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const userId = req.user._id;

    const [conversations, total] = await Promise.all([
      chatModel.find({ participants: userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path:"participants",
          select:"fullName"
        })
        .populate({
          path: "lastMessage",
          select: "content type createdAt senderId",
        })
        .lean(),

      chatModel.countDocuments({ participants: userId })
    ]);

    res.json({
      data: conversations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" });
  }
};


export async function getSingleChat(req, res) {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }

    const chat = await chatModel.findOne({
      _id: chatId,
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "fullName",
      })
      .populate({
        path: "groupAdmin",
        select: "fullName",
      })
      .populate({
        path: "lastMessage",
        select: "content type createdAt senderId",
      })
      .lean();
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    res.status(200).json({
      message: "Chat fetched successfully",
      chat,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching single chat",
      error: error.message,
    });
  }
}