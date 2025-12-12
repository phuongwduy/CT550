const express = require("express");
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const OrderController = require("../controllers/orderController");

router.post("/checkout", verifyToken, OrderController.checkout);
router.get("/", verifyToken, OrderController.getMyOrders);
router.get("/:id", verifyToken, OrderController.getOrderDetail);

module.exports = router;
