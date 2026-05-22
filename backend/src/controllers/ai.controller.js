import Message from "../models/message.model.js";
import { generateReply } from "../services/ai.service.js";

export async function suggestReply(req, res) {
  try {
    const { conversationId } = req.body;

    const currentUserId = req.user._id;

    const messages = await Message.find({
      conversationId,
      type: "text",
    })
      .populate("senderId", "fullName")
      .sort({ createdAt: 1 })
      .limit(40);

    const formattedConversation = messages
      .map((msg) => {
        const sender =
          msg.senderId._id.toString() === currentUserId.toString()
            ? "Me"
            : msg.senderId.fullName;

        return `${sender}: ${msg.content}`;
      })
      .join("\n");

    const prompt = `
You are an AI assistant that suggests chat replies.

TASK:
Given the conversation below, generate exactly 3 short reply options.

RULES:
- Output ONLY the replies
- No introduction
- No explanation
- No numbering
- No labels like "Here are"
- Each reply must be on a new line
- Keep replies natural and conversational

Only generate replies that "Me" can send to the latest message.

Do not simulate other speakers.
Do not repeat greetings unless needed.
Also generate emoji in relevant cases.

If you receive empty conversation, suggest some humerous greeting or conversation starter.

CONVERSATION:
${formattedConversation}
`;

    console.log(prompt);

    const completion = await generateReply(prompt);

    const suggestions = completion
      .split("\n")
      .map((s) => s.replace(/^\d+\.|\-|\*/g, "").trim())
      .filter(Boolean);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
    });
  }
}
