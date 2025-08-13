// adminController.js
const { baseUrl } = require("../config/baseApi");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// admin login--modified
exports.adminActive = async (req, res) => {
  const { sessionId, isAdminOnline } = req.body;
  console.log("Admin active status update:", sessionId, isAdminOnline);

  try {
    const conversation = await Conversation.findOneAndUpdate(
      { sessionId },
      { isAdminOnline },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // ✅ Emit socket event to notify user about admin status
    const io = req.app.get("io"); // get io instance from app
    if (io) {
      io.to(sessionId).emit("admin-status", {
        sessionId,
        isAdminOnline,
        message: isAdminOnline ? "Admin is online" : "Admin is offline",
      });
    }

    res.json({ message: "Admin status updated", conversation });
  } catch (error) {
    console.error("Error updating admin status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// image reply
exports.adminImageReply = async (req, res) => {
  const { sessionId, imageData, fileName } = req.body;
  console.log("rrr", imageData);
  try {
    const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: "Invalid image data" });
    }

    const ext = matches[1];
    const base64Data = matches[2];
    const finalFileName = fileName || `admin_img_${Date.now()}.${ext}`;
    const filePath = path.join(__dirname, "../public", finalFileName);

    fs.writeFileSync(filePath, base64Data, "base64");
    const imageUrl = `${baseUrl}/uploads/${finalFileName}`;
    const conversation = await Conversation.findOne({ sessionId });
    if (!conversation)
      return res.status(404).json({ error: "Conversation not found" });

    const imageMessage = {
      sender: "admin",
      type: "image",
      imageUrl: imageUrl,
      timestamp: new Date(),
    };

    conversation.messages.push(imageMessage);
    await conversation.save();

    // Emit to user
    const io = req.app.get("io");
    if (io) {
      io.to(sessionId).emit("admin-reply", {
        sessionId,
        type: "image",
        imageUrl: imageUrl,
      });
    }

    res.json({ status: "image_sent", imageUrl: imageUrl });
  } catch (error) {
    console.error("Error sending admin image reply:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// admin reply controller in backend
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

//  GET admin status
exports.adminStatus = async (req, res) => {
  try {
    const admin = await User.findById(req.params.adminId);
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    res.status(200).json({ isOnline: admin.isOnline });
  } catch (error) {
    console.error("Error getting admin status:", error);
    res.status(500).json({ error: "Server error" });
  }
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
