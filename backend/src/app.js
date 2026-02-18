import express from 'express'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import chatRoutes from './routes/chat.routes.js'
import userRoutes from './routes/user.routes.js'
import messageRoutes from './routes/message.route.js'
import cors from 'cors'

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))

app.use('/api/auth',authRoutes)
app.use('/api/chats',chatRoutes)
app.use('/api/users',userRoutes)
app.use('/api/messages',messageRoutes)



export default app