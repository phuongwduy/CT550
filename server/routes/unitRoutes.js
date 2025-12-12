const express = require("express");
const router = express.Router();
const unitController = require("../controllers/unitController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", unitController.getAllUnits);
router.post("/", verifyToken, unitController.createUnit);
router.put("/:id", verifyToken, unitController.updateUnit);
router.delete("/:id", verifyToken, unitController.deleteUnit);

module.exports = router;
