const express = require("express");
const { createUser, getAllUsers, getUserByUserId } = require("../controllers/userController");
const router = express.Router();

router.post("/create", createUser);
router.get("/", getAllUsers);
router.get("/singleUser/:userId", getUserByUserId);
// router.get("/singleConversation/:sessionId", getConversationBySessionId);

module.exports = router;
