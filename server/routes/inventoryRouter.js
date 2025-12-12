const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const InventoryController = require("../controllers/inventoryController");

router.post("/tickets", verifyToken, checkRole(["admin", "staff"]), InventoryController.createTicket);
router.get("/tickets", verifyToken, checkRole(["admin", "staff"]), InventoryController.getTickets);
router.get("/tickets/:id", verifyToken, checkRole(["admin", "staff"]), InventoryController.getTicketDetails);

module.exports = router;
