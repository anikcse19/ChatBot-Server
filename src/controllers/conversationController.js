const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { generateBotReply } = require("../utils/botReply");

exports.handleConversation = async (req, res) => {
  const { userId, sessionId, message } = req.body;
// Get socket.io instance
// console.log("user id = ",userId)
const user = await User.findOne({ _id: userId });
// console.log("userdata= ", user.name);
  // 1. Save user's message to conversation
  let conversation = await Conversation.findOne({ sessionId });
  if (!conversation) {
    conversation = await Conversation.create({
      sessionId,
      userName:user.name,
      userId,
      isAdminOnline:false,
      messages: [],
    });
  }

  const userMessage = {
    sender: "user",
    text: message,
    timestamp: new Date(),
  };

  conversation.messages.push(userMessage);
  await conversation.save();
  const io = req.app.get("io"); 
  if(io){
  io.emit("user-message", {
    sessionId,
    userId,
    message: userMessage.text,
  });
  }
  // Emit user's message to admin (if online & listening)


  // 2. Check if any admin is online
  const activeAdmin = await Conversation.findOne({
    sessionId,
    isAdminOnline: true,
  });

  if (activeAdmin) {
    // Admin will reply later manually
    return res.json({ status: "waiting_for_admin" });
  } else {
    // 3. Use bot to generate auto reply
    const botReply = generateBotReply(message);

    const botMessage = {
      sender: "bot",
      text: botReply,
      timestamp: new Date(),
    };

    conversation.messages.push(botMessage);
    await conversation.save();

    // Emit bot reply to user in real-time
    io.to(sessionId).emit("bot_reply", {
      sessionId,
      message: botMessage.text,
    });

    return res.json({ status: "bot_replied", reply: botReply });
  }
};

// get single conversation
exports.getConversationBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    const conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.status(200).json({ conversation });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// get all conversation

exports.getAllConversations = async (req, res) => {
  try {
    const conversation = await Conversation.find();

    if (!conversation) {
      return res.status(404).json({ error: "Conversations not exist" });
    }

    res.status(200).json({ conversation });
  } catch (err) {
    console.error("Error fetching conversation:", err);
    res.status(500).json({ error: "Server error" });
  }
};
