const express = require("express");
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const supplierController = require("../controllers/supplierController");

router.get("/", supplierController.getAllSuppliers);
router.post("/", verifyToken, checkRole(["admin", "staff"]), supplierController.createSupplier);
router.put("/:id", verifyToken, checkRole(["admin", "staff"]), supplierController.updateSupplier);
router.delete("/:id", verifyToken, checkRole(["admin", "staff"]), supplierController.deleteSupplier);

module.exports = router;
