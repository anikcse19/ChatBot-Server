const express = require("express");
const {
  handleConversation,
  getConversationBySessionId,
  getAllConversations,
  handleImageMessage,
} = require("../controllers/conversationController");
const { verifyAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/message", handleConversation);
router.post("/image", handleImageMessage);
router.get("/get-allConversation", verifyAdmin, getAllConversations);
router.get("/singleConversation/:sessionId", getConversationBySessionId);

module.exports = router;
