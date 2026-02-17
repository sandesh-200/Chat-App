import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({

type: {
   type: String,
   enum: ["personal", "group"],
   required: true
},
participants: [{
   type: mongoose.Schema.Types.ObjectId,
   ref: "User"
}],
groupName: String,
groupAdmin: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "User"
},
lastMessage:{
   type: mongoose.Schema.Types.ObjectId,
   ref: "Message"
}
},
{
  timestamps: true
})

chatSchema.index({ participants: 1 });

const chatModel = mongoose.model("Chat", chatSchema);

export default chatModel