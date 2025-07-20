const express = require('express');
const router = express.Router();

const { adminReply, getAllMessages, adminLogin } = require('../controllers/adminController');
// old
router.post("/reply", adminReply);
// new
router.put("/activity",adminLogin)
// router.put("/admin/reply", adminLogin);
// old
router.get("/get-messages", getAllMessages);   
module.exports = router;
