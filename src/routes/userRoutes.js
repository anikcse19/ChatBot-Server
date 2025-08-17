const express = require("express");
const { createUser, getAllUsers, getUserByUserId, userLogin } = require("../controllers/userController");
const router = express.Router();

router.post("/create", createUser);
router.post("/login",userLogin);
router.get("/", getAllUsers);
router.get("/singleUser/:userId", getUserByUserId);
// router.get("/singleConversation/:sessionId", getConversationBySessionId);

module.exports = router;
