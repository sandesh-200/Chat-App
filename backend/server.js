import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import { Server } from "socket.io";
import connectDB from "./src/db/db.js";
import http from "http";
import { registerChatSocket } from "./src/sockets/chat.socket.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

registerChatSocket(io);

export { io };
const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect DB:", error);
  }
};

startServer();