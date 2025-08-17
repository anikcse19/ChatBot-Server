const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: {
    type: String,
    enum: ["user", "admin"], // ✅ Valid enum values
    required: true,
  },
  password: { type: String, required: true }, // added password
  adminId: {
    type: mongoose.Schema.Types.ObjectId, // Who created the ticket (could be admin)
    ref: "User",
    required: function () {
      return this.role === "user";
    },
  },
  sessionId: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("User", UserSchema);
