const express = require("express");
const router = express.Router();
const BatchController = require("../controllers/batchController");
const { verifyToken, checkRole } = require("../middleware/authMiddleware");

router.get("/product/:product_id", verifyToken, checkRole(["admin", "staff"]), BatchController.getProductBatches);
router.get("/inventory/overview", verifyToken, checkRole(["admin", "staff"]), BatchController.getInventoryOverview);
router.get("/batch/:batch_id/movements", verifyToken, checkRole(["admin", "staff"]), BatchController.getBatchMovements);
module.exports = router;
