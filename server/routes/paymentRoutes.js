const express = require("express");
const router = express.Router();
const PaymentController = require("../controllers/paymentController");

router.post("/paypal/checkout", PaymentController.paypalCheckout);
router.post("/paypal/capture", PaymentController.paypalCapture);

module.exports = router;
