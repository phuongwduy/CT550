const db = require('../config/db');

const CartModel = {
  async getOrCreateCartByUserId(userId) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [rows] = await conn.query(
        'SELECT id FROM carts WHERE user_id = ? LIMIT 1',
        [userId]
      );

      if (rows.length) {
        await conn.commit();
        return rows[0];
      }

      const [result] = await conn.query(
        'INSERT INTO carts (user_id, created_at, updated_at) VALUES (?, NOW(), NOW())',
        [userId]
      );
      await conn.commit();
      return { id: result.insertId };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async getCartItems(cartId) {
    const [rows] = await db.query(
      `SELECT 
        ci.id AS item_id,
        ci.product_id,
        p.name AS product_name,
        p.image AS product_image,
        ci.quantity,
        ci.price,
        (ci.quantity * ci.price) AS line_total,
        p.stock
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.id DESC`,
      [cartId]
    );
    return rows;
  },

  async getCartTotals(cartId) {
    const [rows] = await db.query(
      `SELECT 
        COALESCE(SUM(quantity), 0) AS total_items,
        COALESCE(SUM(quantity * price), 0) AS subtotal
      FROM cart_items
      WHERE cart_id = ?`,
      [cartId]
    );
    return rows[0];
  },

  async addOrIncrementItem({ cartId, productId, quantity = 1 }) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [prodRows] = await conn.query(
        'SELECT price FROM products WHERE id = ? LIMIT 1',
        [productId]
      );
      if (!prodRows.length) throw new Error('PRODUCT_NOT_FOUND');
      const price = prodRows[0].price;

      const [itemRows] = await conn.query(
        'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
        [cartId, productId]
      );

      if (itemRows.length) {
        const newQty = itemRows[0].quantity + Number(quantity);
        await conn.query(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [newQty, itemRows[0].id]
        );
        await conn.commit();
        return { id: itemRows[0].id, quantity: newQty, price };
      } else {
        const [result] = await conn.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [cartId, productId, Number(quantity), price]
        );
        await conn.commit();
        return { id: result.insertId, quantity: Number(quantity), price };
      }
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  async updateItemQuantity({ itemId, quantity }) {
    if (Number(quantity) < 1) throw new Error('INVALID_QTY');
    const [rs] = await db.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [Number(quantity), itemId]
    );
    if (rs.affectedRows === 0) throw new Error('ITEM_NOT_FOUND');
    return true;
  },

  async removeItem(itemId) {
    const [rs] = await db.query(
      'DELETE FROM cart_items WHERE id = ?',
      [itemId]
    );
    if (rs.affectedRows === 0) throw new Error('ITEM_NOT_FOUND');
    return true;
  },

  async clearCart(cartId) {
    await db.query(
      'DELETE FROM cart_items WHERE cart_id = ?',
      [cartId]
    );
    return true;
  },
  getProductById: async (productId) => {
  const [rows] = await db.query("SELECT * FROM products WHERE id = ?", [productId]);
  return rows[0];
},

getCartItemByProduct: async (cartId, productId) => {
  const [rows] = await db.query(
    "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cartId, productId]
  );
  return rows[0];
},

};

module.exports = CartModel;
