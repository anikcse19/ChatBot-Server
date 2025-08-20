// adminController.js
const { baseUrl } = require("../config/baseApi");
const Conversation = require("../models/Conversation");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// admin login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    console.log(user.role);
    if (
      user.role !== "admin" &&
      user.role !== "agent" &&
      user.role !== "sub-admin"
    ) {
      return res
        .status(403)
        .json({ error: "Access denied. Admins, agents and sub-admin only." });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user?.name,
        adminId: user?.adminId,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};

exports.adminActive = async (req, res) => {
  const { sessionId, isAdminOnline } = req.body;

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
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};

// image reply
exports.adminImageReply = async (req, res) => {
  const { sessionId, imageData, fileName, repliedBy } = req.body;
 
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
      repliedBy: repliedBy,
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
  } catch (err) {
    res.status(500).json({ error: err?.message });
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
  } catch (err) {
    res.status(500).json({ error: err?.message });
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
  } catch (err) {
    return res.status(500).json({ error: err?.message });
  }
};
// get all subAdmins or agents created under the current admin
exports.getAllSubAdmins = async (req, res) => {
  console.log("current admin ", req.user);
  try {
    const subAdmins = await User.find({
      role: { $in: ["sub-admin", "agent"] },
      adminId: req.user.id, // must match current logged-in admin
    });

    if (!subAdmins || subAdmins.length === 0) {
      return res
        .status(404)
        .json({ error: "No subAdmins or agents found for this admin" });
    }

    res.status(200).json({ subAdmins });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};
// delete a subAdmins or agents  (only admin can perform this)
exports.deleteUser = async (req, res) => {
  try {
    // Check if the logged-in user is admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: Only admins can delete users" });
    }

    const { id } = req.params; // user ID to delete

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (err) {
    res.status(500).json({ error: err?.message });
  }
};
