const express = require('express');
const { handleConversation, getConversationBySessionId, getAllConversations } = require('../controllers/conversationController');
const router = express.Router();


router.post('/message', handleConversation);
router.get("/get-allConversation", getAllConversations);
router.get("/singleConversation/:sessionId", getConversationBySessionId);

module.exports = router;