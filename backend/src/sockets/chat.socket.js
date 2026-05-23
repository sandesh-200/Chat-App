import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import cookie from "cookie";
import jwt, { decode } from "jsonwebtoken";
import userModel from "../models/user.model.js";

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
    await userModel.findByIdAndUpdate(socket.user._id, { status: "online" });

    io.emit("user-status-changed", {
      userId: socket.user._id,
      status: "online",
    });

    socket.on("setup", (userId) => {
      socket.join(userId);
    });

    socket.on("join-chat", (chatId) => {
      socket.join(chatId);
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

          sender: {
            _id: newMessage.senderId._id,
            fullName: newMessage.senderId.fullName,
          },
        };

        await Chat.findByIdAndUpdate(conversationId, {
          lastMessage: newMessage._id,
        });

        io.to(conversationId).emit("receive-message", formattedMessage);
      } catch (error) {
        console.error("Socket send-message error:", error);
      }
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected:", socket.user.fullName);
      await userModel.findByIdAndUpdate(socket.user._id, { status: "offline" });
      io.emit("user-status-changed", {
        userId: socket.user._id,
        status: "offline",
      });
    });
  });
};
