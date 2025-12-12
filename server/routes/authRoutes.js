const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

//Bắt đầu quá trình đăng ký (gửi mã xác thực qua email)
router.post('/register/request', authController.requestVerification);

// Xác nhận mã OTP để hoàn tất đăng ký
router.post('/register/confirm', authController.confirmVerification);

// Đăng nhập
router.post('/login', authController.login);

router.post('/forgot/request', authController.forgotPasswordRequest);
router.post('/forgot/confirm', authController.forgotPasswordConfirm);
// Đăng nhập với Google
router.post('/google', authController.googleLogin);
module.exports = router;
