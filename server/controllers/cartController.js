// controllers/cartController.js
const CartModel = require('../models/cartModel');


const CartController = {
  // GET /api/cart
  getMyCart: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'UNAUTHORIZED' });

      const { id: cartId } = await CartModel.getOrCreateCartByUserId(userId);
      const items = await CartModel.getCartItems(cartId);
      const totals = await CartModel.getCartTotals(cartId);

      return res.json({ cart_id: cartId, items, totals });
    } catch (err) {
      console.error('getMyCart error:', err);
      return res.status(500).json({ message: 'SERVER_ERROR' });
    }
  },

  // POST /api/cart/items  { product_id, quantity }
  addItem: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'UNAUTHORIZED' });

      const { product_id, quantity = 1 } = req.body || {};
      if (!product_id)
        return res.status(400).json({ message: 'product_id is required' });
      if (quantity && Number(quantity) < 1)
        return res.status(400).json({ message: 'quantity must be >= 1' });

      const { id: cartId } = await CartModel.getOrCreateCartByUserId(userId);

      // Lấy tồn kho từ bảng sản phẩm
      const product = await CartModel.getProductById(product_id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      const stock = product.stock;

      //  Lấy số lượng đã có trong giỏ
      const existingItem = await CartModel.getCartItemByProduct(cartId, product_id);
      const currentQty = existingItem?.quantity || 0;
      const totalQty = currentQty + Number(quantity);

      //  Nếu vượt tồn kho thì chặn
      if (totalQty > stock) {
        return res.status(400).json({
          message: `Không đủ tồn kho.`,
        });
      }

      //  Nếu hợp lệ thì thêm hoặc cập nhật
      const item = await CartModel.addOrIncrementItem({
        cartId,
        productId: product_id,
        quantity: Number(quantity),
      });

      const items = await CartModel.getCartItems(cartId);
      const totals = await CartModel.getCartTotals(cartId);

      return res.status(201).json({ message: 'ADDED', item, items, totals });
    } catch (err) {
      if (err.message === 'PRODUCT_NOT_FOUND')
        return res.status(404).json({ message: 'Product not found' });
      console.error('addItem error:', err);
      return res.status(500).json({ message: 'SERVER_ERROR' });
    }
  },


  // PATCH /api/cart/items/:itemId  { quantity }
  updateItem: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'UNAUTHORIZED' });

      const { itemId } = req.params;
      const { quantity } = req.body || {};
      if (!quantity || Number(quantity) < 1)
        return res.status(400).json({ message: 'quantity must be >= 1' });

      await CartModel.updateItemQuantity({ itemId, quantity: Number(quantity) });

      const { id: cartId } = await CartModel.getOrCreateCartByUserId(userId);
      const items = await CartModel.getCartItems(cartId);
      const totals = await CartModel.getCartTotals(cartId);

      return res.json({ message: 'UPDATED', items, totals });
    } catch (err) {
      if (err.message === 'ITEM_NOT_FOUND')
        return res.status(404).json({ message: 'Cart item not found' });
      if (err.message === 'INVALID_QTY')
        return res.status(400).json({ message: 'Invalid quantity' });
      console.error('updateItem error:', err);
      return res.status(500).json({ message: 'SERVER_ERROR' });
    }
  },

  // DELETE /api/cart/items/:itemId
  removeItem: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'UNAUTHORIZED' });

      const { itemId } = req.params;
      await CartModel.removeItem(itemId);

      const { id: cartId } = await CartModel.getOrCreateCartByUserId(userId);
      const items = await CartModel.getCartItems(cartId);
      const totals = await CartModel.getCartTotals(cartId);

      return res.json({ message: 'REMOVED', items, totals });
    } catch (err) {
      if (err.message === 'ITEM_NOT_FOUND')
        return res.status(404).json({ message: 'Cart item not found' });
      console.error('removeItem error:', err);
      return res.status(500).json({ message: 'SERVER_ERROR' });
    }
  },

  // DELETE /api/cart
  clear: async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'UNAUTHORIZED' });

      const { id: cartId } = await CartModel.getOrCreateCartByUserId(userId);
      await CartModel.clearCart(cartId);

      return res.json({
        message: 'CLEARED',
        items: [],
        totals: { total_items: 0, subtotal: 0 },
      });
    } catch (err) {
      console.error('clear error:', err);
      return res.status(500).json({ message: 'SERVER_ERROR' });
    }
  },
};

module.exports = CartController;
