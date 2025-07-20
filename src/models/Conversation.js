const mongoose = require('mongoose');
const { Types } = mongoose;
const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ["user", "admin", "bot"], // ✅ Valid enum values
    required: true,
  },
  text: String,
  timestamp: { type: Date, default: Date.now },
});

const ConversationSchema = new mongoose.Schema({
  userId: Types.ObjectId,
  sessionId: String,
  userName: String,
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', ConversationSchema);
