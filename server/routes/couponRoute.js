const express = require("express");
const router = express.Router();
const controller = require("../controllers/couponController");
const { verifyToken } = require("../middleware/authMiddleware");
// Admin quản lý mã giảm giá
router.get("/", controller.getCoupons);           // Lấy danh sách
router.get("/:id", controller.getCouponById);     // Lấy chi tiết
router.post("/", verifyToken, controller.createCoupon);        // Tạo mới
router.put("/:id", verifyToken, controller.updateCoupon);      // Cập nhật
router.delete("/:id", verifyToken, controller.deleteCoupon);   // Xóa

// Người dùng áp dụng mã giảm giá
router.post("/apply", controller.applyCoupon);    // Áp dụng mã
router.post("/subscribe", controller.sendCouponToCustomer); // Gửi mã giảm giá cho khách hàng qua email

module.exports = router;
