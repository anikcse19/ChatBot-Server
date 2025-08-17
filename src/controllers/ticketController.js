const Conversation = require("../models/Conversation");
const Ticket = require("../models/Ticket");
const User = require("../models/User");

exports.createTicket = async (req, res) => {
  try {
    const {
      userId,
      createdBy,
      subject,
      description,
      category,
      priority,
      linkedChatId,
      attachments,
    } = req.body;

    // Basic validation
    if (
      !userId ||
      !createdBy ||
      !subject ||
      !description ||
      !category ||
      !priority
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }
    const existUser = await User.findOne({ _id: userId });
    console.log("user", existUser);
    const existConversation = await Conversation.findOne({
      sessionId: linkedChatId,
    });
    if (!existUser) {
      return res.status(409).json({ error: "User is not exists" });
    }
    if (!existConversation) {
      return res.status(409).json({ error: "Conversation is not exists" });
    }

    const newTicket = new Ticket({
      userId,
      createdBy,
      subject,
      description,
      category,
      priority,
      linkedChatId,
      attachments,
      attachments,
      status: "Pending", // default
    });
    const savedTicket = await newTicket.save();
    return res.status(201).json({
      message: "Ticket created successfully",
      ticket: savedTicket,
    });
  } catch (err) {
    console.error("Create Ticket error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};
// get all trickect
exports.getAllTickets = async (req, res) => {
  const adminId = req.user.id; // Extracted from JWT middleware
  try {
    // Fetch only tickets created by this admin
    const tickets = await Ticket.find({ createdBy: adminId });

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ error: "No tickets found for this admin" });
    }

    res.status(200).json({ tickets });
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ error: "Server error" });
  }
};
exports.updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params; // ticket ID from URL
    const { status } = req.body; // new status from request body

    // Validate status
    if (!["Pending", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = status;
    await ticket.save();

    return res.status(200).json({ message: "Ticket status updated", ticket });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
