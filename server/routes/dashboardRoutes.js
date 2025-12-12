const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authMiddleware");
// Route: Lấy dữ liệu thống kê cho Dashboard Admin
router.get("/stats", verifyToken, DashboardController.getStats);

module.exports = router;
