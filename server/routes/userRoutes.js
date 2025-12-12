const express = require("express");
const router = express.Router();
const multer = require("multer");
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

router.get("/profile", verifyToken, userController.getUserProfile);
router.put("/profile", verifyToken, userController.updateUserInfo);
router.post("/avatar", verifyToken, upload.single("avatar"), userController.updateAvatar);

router.post('/change-password', userController.changePassword);

module.exports = router;
