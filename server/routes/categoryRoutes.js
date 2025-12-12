const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');


router.get('/', categoryController.getAllCategories);
// chỉ admin và staff được phép chỉnh sửa
router.post('/', verifyToken, checkRole(["admin", "staff"]), categoryController.createCategory);
router.put('/:id', verifyToken, checkRole(["admin", "staff"]), categoryController.updateCategory);
router.delete('/:id', verifyToken, checkRole(["admin", "staff"]), categoryController.deleteCategory);

module.exports = router;
