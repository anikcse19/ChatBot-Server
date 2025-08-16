const express = require('express');
const router = express.Router();

const { adminReply, getAllMessages,  adminStatus, adminActive, adminImageReply, adminLogin} = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/authMiddleware');
// old
router.post("/login",adminLogin);

router.post("/reply", adminReply);
router.post("/reply/image",adminImageReply);
// new
router.put("/activity", adminActive);
router.get("/status/:adminId", adminStatus);
// router.put("/admin/reply", adminLogin);
// old
router.get("/get-messages", getAllMessages);   
module.exports = router;
