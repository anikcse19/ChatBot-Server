const express = require('express');
const router = express.Router();

const { adminReply, getAllMessages,  adminStatus, adminActive, adminImageReply } = require('../controllers/adminController');
// old
router.post("/reply", adminReply);
router.post("/reply/image",adminImageReply);
// new
router.put("/activity", adminActive);
router.get("/status/:adminId", adminStatus);
// router.put("/admin/reply", adminLogin);
// old
router.get("/get-messages", getAllMessages);   
module.exports = router;
