const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: {
    type: String,
    enum: ["user", "admin"], // ✅ Valid enum values
    required: true,
  },
  sessionId:String,
  isOnline: Boolean,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("User", UserSchema);
