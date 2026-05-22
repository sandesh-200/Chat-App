import mongoose from "mongoose";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MONGODB CONNECTED");
  } catch (error) {
    console.log("MONGODB connection error:", error);

    process.exit(1);
  }
}

export default connectDB;