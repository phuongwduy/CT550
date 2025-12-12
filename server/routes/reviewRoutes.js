const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const reviewController = require("../controllers/reviewController");

// Lấy tất cả đánh giá (có thể lọc theo sản phẩm)
router.get("/", reviewController.getReviews);
router.get("/review-stats", reviewController.getReviewStats);

// Gửi đánh giá mới
router.post("/", verifyToken, reviewController.createReview);

// Xóa đánh giá (admin)
router.delete("/:id", verifyToken, reviewController.deleteReview);

router.get("/can-review", verifyToken, reviewController.checkCanReview);

router.patch("/:id", verifyToken, checkRole(["admin"]), reviewController.toggleReviewHidden);

router.get("/review-replies", reviewController.getRepliesByProduct);
router.post("/review-replies", verifyToken, reviewController.createReply);
router.delete("/review-replies/:id", reviewController.deleteReply);
module.exports = router;
