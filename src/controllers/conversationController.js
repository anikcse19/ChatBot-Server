// conversationController.js
const { baseUrl } = require("../config/baseApi");
const Conversation = require("../models/Conversation");
// const Conversation = require("../models/Conversation");
const User = require("../models/User");
const { generateBotReply } = require("../utils/botReply");
const fs = require("fs");
const path = require("path");

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
      userName: user.name,
      userId,
      isAdminOnline: false,
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
  if (io) {
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
    const botReply = await generateBotReply(message);

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
// image
exports.handleImageMessage = async (req, res) => {
  const { userId, sessionId, imageData, fileName } = req.body;
  console.log("rrr", imageData);
  try {
    const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: "Invalid image data" });
    }

    const ext = matches[1];
    const base64Data = matches[2];
    const finalFileName = fileName || `img_${Date.now()}.${ext}`;
    const filePath = path.join(__dirname, "../public/uploads", finalFileName);
    console.log(`Image saved: ${finalFileName}`);

    // Ensure folder exists before saving
    fs.mkdirSync(path.join(__dirname, "../public/uploads"), {
      recursive: true,
    });
    // Save image
    fs.writeFileSync(filePath, base64Data, "base64");
    const imageUrl = `${baseUrl}/uploads/${finalFileName}`;

    // Find or create conversation
    let conversation = await Conversation.findOne({ sessionId });
    const user = await User.findById(userId);
    if (!conversation) {
      conversation = await Conversation.create({
        sessionId,
        userName: user?.name || "Unknown User",
        userId,
        isAdminOnline: false,
        messages: [],
      });
    }

    const imageMessage = {
      sender: "user",
      type: "image",
      imageUrl: imageUrl,
      timestamp: new Date(),
    };

    conversation.messages.push(imageMessage);
    await conversation.save();

    // Emit to admin
    const io = req.app.get("io");
    if (io) {
      io.to(sessionId).emit("user-message", {
        sessionId,
        userId,
        type: "image",
        imageUrl: imageUrl,
      });
    }

    res.json({ status: "image_sent", imageUrl: imageUrl });
  } catch (error) {
    console.error("Error handling image message:", error);
    res.status(500).json({ error: "Server error" });
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
