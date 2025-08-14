const express = require("express");
const { createTicket, getAllTickets } = require("../controllers/ticketController");

const router = express.Router();

router.post("/create",createTicket);
router.get("/", getAllTickets);
router.patch("/ticket/:ticketId", updateTicketStatus);
module.exports = router;