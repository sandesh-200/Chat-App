import dotenv from 'dotenv'
dotenv.config()
import app from "./src/app.js";
import connectDB from './src/db/db.js';

connectDB()

app.listen(3000,()=>{
    console.log("Server listening on port 3000")
})