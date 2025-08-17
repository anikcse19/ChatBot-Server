const express = require("express");
const { createTicket, getAllTickets, updateTicketStatus } = require("../controllers/ticketController");
const { verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create",createTicket);
router.get("/", verifyAdmin, getAllTickets);
router.patch("/ticket/:ticketId", verifyAdmin, updateTicketStatus);
module.exports = router;