const express = require('express');
const router = express.Router();

const { adminReply, getAllMessages,  adminStatus, adminActive } = require('../controllers/adminController');
// old
router.post("/reply", adminReply);
// new
router.put("/activity", adminActive);
router.get("/status/:adminId", adminStatus);
// router.put("/admin/reply", adminLogin);
// old
router.get("/get-messages", getAllMessages);   
module.exports = router;
