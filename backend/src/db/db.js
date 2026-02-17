import mongoose, { mongo } from "mongoose";

function connectDB(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(()=>{
        console.log("MONGODB CONNECTED")
    })
    .catch((error)=>{
        console.log("MONGODB connection error: ",error)
    })
}

export default connectDB