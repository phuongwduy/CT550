// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminOrderController = require("../controllers/admin/adminOrderController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

router.get("/users", verifyToken, checkRole(["admin"]), adminController.getAllUsers);
router.post("/users", verifyToken, checkRole(["admin"]), adminController.createUserByAdmin);
router.put("/users/:id/role", verifyToken, checkRole(["admin"]), adminController.updateUserRole);
router.delete("/users/:id", verifyToken, checkRole(["admin"]), adminController.deleteUser);

router.get("/orders/:id", verifyToken, checkRole(["admin", "staff"]), adminOrderController.getOrderById);
router.get("/orders", verifyToken, checkRole(["admin", "staff"]), adminOrderController.getAllOrders);
router.patch("/orders/:id", verifyToken, checkRole(["admin", "staff"]), adminOrderController.updateOrderStatus);

module.exports = router;
