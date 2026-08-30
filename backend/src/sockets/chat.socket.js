import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

// Map to track active user socket connections: userId -> Set of socketIds
const userSockets = new Map();

export const registerChatSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      let token = null;

      // 1. Try cookie first (desktop/same-site browsers)
      const cookies = socket.handshake.headers.cookie;
      if (cookies) {
        const parsedCookies = cookie.parse(cookies);
        token = parsedCookies.token || null;
      }

      // 2. Fallback to handshake auth token (mobile/cross-site browsers where cookies are blocked)
      if (!token && socket.handshake.auth?.token) {
        token = socket.handshake.auth.token;
      }

      if (!token) return next(new Error("Authentication error: Token missing"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id).select("-password");
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();

    // 1. Join personal room for global user-specific notifications
    socket.join(userId);

    // 2. Track connection logic for accurate online/offline status
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
      // First active connection: mark online
      await userModel.findByIdAndUpdate(userId, { status: "online" });
      io.emit("user-status-changed", {
        userId,
        status: "online",
      });
    }
    userSockets.get(userId).add(socket.id);

    socket.on("setup", (uid) => {
      socket.join(uid);
    });

    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
    });

    socket.on("mark-read", async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversationId, readBy: { $ne: userId } },
          { $push: { readBy: userId } }
        );
      } catch (error) {
        console.error("mark-read error:", error);
      }
    });

    socket.on("send-message", async (data) => {
      try {
        const { conversationId, content, type } = data;
        const senderId = socket.user._id;

        let newMessage = await Message.create({
          conversationId,
          senderId,
          content,
          type,
          readBy: [senderId],
        });

        newMessage = await newMessage.populate("senderId", "fullName avatar");
        
        const formattedMessage = {
          _id: newMessage._id,
          content: newMessage.content,
          createdAt: newMessage.createdAt,
          conversationId: newMessage.conversationId, 
          readBy: newMessage.readBy,
          sender: {
            _id: newMessage.senderId._id,
            fullName: newMessage.senderId.fullName,
          },
        };

        const updatedChat = await Chat.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id,
        }, { new: true });

        // Emit message to all participants directly so they get it globally
        if (updatedChat && updatedChat.participants) {
          updatedChat.participants.forEach((participantId) => {
             io.to(participantId.toString()).emit("receive-message", formattedMessage);
          });
        }
      } catch (error) {
        console.error("Socket send-message error:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.user.fullName);
      
      if (userSockets.has(userId)) {
        const sockets = userSockets.get(userId);
        sockets.delete(socket.id);

        // If no active connections remain, user is truly offline
        if (sockets.size === 0) {
          userSockets.delete(userId);
          await userModel.findByIdAndUpdate(userId, { status: "offline" });
          io.emit("user-status-changed", {
            userId,
            status: "offline",
          });
        }
      }
    });
  });
};
