const express = require("express");
const router = express.Router();
const {
  adminReply,
  getAllMessages,
  adminStatus,
  adminActive,
  adminImageReply,
  adminLogin,
  getAllSubAdmins,
  deleteUser,
} = require("../controllers/adminController");
const { createUser } = require("../controllers/userController");
const { verifyAdmin } = require("../middleware/authMiddleware");
// old
router.post("/login", adminLogin);
router.post("/reply", adminReply);
router.post("/reply/image", adminImageReply);
router.put("/activity", adminActive);
router.get("/status/:adminId", adminStatus);
router.get("/get-messages", getAllMessages);
// subAdmin routes
router.post("/create-subAdmin", verifyAdmin, createUser);
router.get("/get-all-subAdmins", verifyAdmin, getAllSubAdmins);
router.delete("/member/:id", verifyAdmin, deleteUser);
module.exports = router;
