const express = require("express");
const { createTicket, getAllTickets, updateTicketStatus } = require("../controllers/ticketController");

const router = express.Router();

router.post("/create",createTicket);
router.get("/", getAllTickets);
router.patch("/ticket/:ticketId", updateTicketStatus);
module.exports = router;