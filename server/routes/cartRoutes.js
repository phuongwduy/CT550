const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const CartController = require('../controllers/cartController');

router.get('/', verifyToken, CartController.getMyCart);
router.post('/items', verifyToken, CartController.addItem);
router.patch('/items/:itemId', verifyToken, CartController.updateItem);
router.delete('/items/:itemId', verifyToken, CartController.removeItem);
router.delete('/', verifyToken, CartController.clear);

module.exports = router;
