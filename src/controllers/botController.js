const Conversation = require("../models/Conversation");
const Complaint = require("../models/Complaint");
const { findBestReply } = require("../utils/matcher");

exports.handleMessage = async (req, res) => {
  const { userId, sessionId, name, email, messages } = req.body;
  if (!userId || !sessionId || !messages || !Array.isArray(messages)) {

    return res.status(400).json({
      error: "Missing required fields: userId, sessionId, or messages[]",
    });
  }

  let conversation = await Conversation.findOne({ sessionId });

  if (!conversation) {
    conversation = await Conversation.create({
      userId,
      sessionId,
      messages: [],
    });
  }

  // Save user message
  conversation.messages.push({ sender: "user", messages });

  // Skip bot if admin is active
  if (conversation.adminActive) {
    await conversation.save();
    return res.json({ reply: null, note: "Admin is active. Bot disabled." });
  }

  const reply = await findBestReply(messages);

  if (!reply) {
    if (name && email) {
      await Complaint.create({ name, email, messages });
    }
    const fallbackReply =
      "ধন্যবাদ। আমরা আপনার সমস্যাটি রেজিস্টার করেছি এবং খুব দ্রুত যোগাযোগ করব।";
    conversation.messages.push({ sender: "bot", message: fallbackReply });
    await conversation.save();
    return res.json({ reply: fallbackReply });
  }

  conversation.messages.push({ sender: "bot", message: reply });
  await conversation.save();

  return res.json({ reply });
};

exports.getAllBotMessages = async (req, res) => {
  try {
    const conversations = await Conversation.find();

    // Filter only bot messages
    const botMessages = conversations.flatMap((conv) =>
      conv.messages
        .filter((msg) => msg.sender === "bot") // 👈 Only messages from bot
        .map((msg) => ({
          sessionId: conv.sessionId,
          sender: msg.sender,
          message: msg.message,
          timestamp: msg.timestamp,
        }))
    );

    return res.status(200).json({ messages: botMessages });
  } catch (err) {
    console.error("Error fetching bot messages:", err);
    return res.status(500).json({ error: err?.message });
  }
};
