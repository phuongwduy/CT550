const express = require("express");
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const addressController = require("../controllers/addressController");

router.get("/", verifyToken, addressController.getAll);
router.post("/", verifyToken, addressController.create);
router.put("/:id", verifyToken, addressController.update);
router.delete("/:id", verifyToken, addressController.remove);

module.exports = router;
