import dotenv from 'dotenv'
dotenv.config()
import app from "./src/app.js";
import { Server } from 'socket.io'
import connectDB from './src/db/db.js';
import http from 'http'
import { registerChatSocket } from './src/sockets/chat.socket.js';

const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:"http://localhost:5173",
        credentials:true
    },
})

registerChatSocket(io)

export {io};

connectDB()

server.listen(3000,()=>{
    console.log("Server listening on port 3000")
})