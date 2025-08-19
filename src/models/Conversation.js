const mongoose = require("mongoose");
const { Types } = mongoose;

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "admin", "bot"], // ✅ Only valid values
    required: true,
  },
  text: {
    type: String,
    default: null, // allow empty if it's an image
  },
  imageUrl: {
    type: String, // path or URL to the stored image
    default: null,
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId, // Who created the ticket (could be admin)
    ref: "User",
    default: null,
  },
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new mongoose.Schema({
  userId: Types.ObjectId,
  adminId: String,
  sessionId: String,
  userName: String,
  isAdminOnline: Boolean,
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Conversation", ConversationSchema);
