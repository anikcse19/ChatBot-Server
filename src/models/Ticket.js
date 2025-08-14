const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId, // Ref to User collection
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // Who created the ticket (could be admin)
      ref: "User",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    //   enum: ["Technical", "Billing", "General", "Other"], // You can adjust categories
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Resolved"],
      default: "Pending",
    },
    linkedChatId: {
      type: String, // Reference to chat/conversation collection
     
    },
    attachments: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } } // Automatically adds createdAt & updatedAt
);
module.exports = mongoose.model("Ticket", TicketSchema);