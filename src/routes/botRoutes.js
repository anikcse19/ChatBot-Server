const express = require('express');
const router = express.Router();
const { handleMessage, getAllBotMessages } = require('../controllers/botController');


router.post('/message', handleMessage);
router.get("/get-messages", getAllBotMessages);   

module.exports = router;
