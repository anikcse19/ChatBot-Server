const express = require('express');
const { handleConversation, getConversationBySessionId, getAllConversations, handleImageMessage } = require('../controllers/conversationController');
const router = express.Router();


router.post('/message', handleConversation);
router.post("/image", handleImageMessage);
router.get("/get-allConversation", getAllConversations);
router.get("/singleConversation/:sessionId", getConversationBySessionId);

module.exports = router;