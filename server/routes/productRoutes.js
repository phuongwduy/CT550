const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
// Các route CRUD
router.get('/', productController.getAllProducts);
router.get("/top-selling", productController.getTopSelling);
router.get('/:id', productController.getProductById);
router.post("/upload", productController.uploadImage);




router.post('/', verifyToken, checkRole(["admin", "staff"]), productController.createProduct);
router.put('/:id', verifyToken, checkRole(["admin", "staff"]), productController.updateProduct);
router.delete('/:id', verifyToken, checkRole(["admin", "staff"]), productController.deleteProduct);

router.get('/supplier/:supplierId', verifyToken, checkRole(["admin", "staff"]), productController.getProductsBySupplier);

module.exports = router;
