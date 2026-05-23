import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_API_URL || "http://localhost:3000",
  {
    withCredentials: true,
    // Pass token via auth for mobile/cross-site environments where cookies are blocked
    auth: {
      token: localStorage.getItem("token") || "",
    },
  }
);

export default socket;
