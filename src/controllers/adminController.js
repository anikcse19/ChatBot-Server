const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { learnReplyFromAdmin } = require("../utils/matcher");

// admin login
exports.adminLogin=async (req, res) => {
  const { adminId, isOnline } = req.body;
  await User.findByIdAndUpdate(adminId, { isOnline });
  res.json({ message: "Admin status updated" });
};
// admin reply controler in backend
exports.adminReply = async (req, res) => {
  const { sessionId, message } = req.body;

  // 1. Find the conversation
  const conversation = await Conversation.findOne({ sessionId });
  if (!conversation)
    return res.status(404).json({ error: "Conversation not found" });

  // ✅ Use message directly
  conversation.messages.push(message);

  await conversation.save();

  // Emit real-time update
  const io = req.app.get("io");
    console.log("Emitting admin-reply", {
      sessionId,
      text: message.text,
    });
  if (io) {
    io.to(sessionId).emit("admin-reply", {
      sessionId,
      text: message.text, // or message itself if needed
    });
  }

  res.json({ message: "Reply saved and emitted" });
};


// exports.adminReply = async (req, res) => {
//   const { sessionId, messages } = req.body;

//   if (!sessionId || !messages) {
//     return res.status(400).json({ error: "Missing sessionId or message" });
//   }

//   let conversation = await Conversation.findOne({ sessionId });

//   if (!conversation) {
//     return res.status(404).json({ error: "Conversation not found" });
//   }

//   // Set admin as active
//   conversation.adminActive = true;

//   // Save admin message
//   conversation.messages.push({ sender: "admin", messages });

//   await conversation.save();

//   // Optionally: store this message for training (your `matcher.js`)
//   await learnReplyFromAdmin(conversation.messages); // implement this function

//   return res.json({ success: true });
// };
exports.getAllMessages = async (req, res) => {
  try {
    const conversations = await Conversation.find();
// conversations[0].messages.forEach((message, index) => {
//   console.log(`Message ${index + 1}:`, message);
// });
    // Flatten all messages into one array (optional)
    const allMessages = conversations.flatMap((conv) =>
      conv.messages
        .filter((msg) => msg.sender === "admin")
        .map((msg) => ({
          sessionId: conv.sessionId,
          sender: msg.sender,
          message: msg.message,
          timestamp: msg.timestamp,
        }))
    );

    return res.status(200).json({ messages: allMessages });
  } catch (error) {
    console.error("Error fetching all messages:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};