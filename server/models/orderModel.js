// models/orderModel.js
const db = require("../config/db");

const Order = {
  async checkStock(conn, cartItems) {
    for (const item of cartItems) {
      const [rows] = await conn.query("SELECT stock FROM products WHERE id = ?", [item.product_id]);
      if (!rows.length) throw new Error("PRODUCT_NOT_FOUND");
      if (item.quantity > rows[0].stock) throw new Error(`OUT_OF_STOCK:${item.product_id}`);
    }
  },

  async deductStock(conn, cartItems) {
    for (const item of cartItems) {
      await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.product_id]);
    }
  },

  async getAddress(conn, address_id, userId) {
    const [rows] = await conn.query(
      `SELECT 
          ua.id,
          ua.receiver_name,
          ua.phone,
          ua.detail,
          ua.province_code,
          ua.commune_code,
          ua.country,
          ua.is_default,
          p.name AS province_name,
          c.name AS commune_name,
          CONCAT(ua.detail, ', ', c.name, ', ', p.name, ', ', ua.country) AS full_address
      FROM user_addresses ua
      LEFT JOIN provinces p ON ua.province_code = p.code
      LEFT JOIN communes c ON ua.commune_code = c.code
      WHERE ua.id = ? AND ua.user_id = ?`,
      [address_id, userId]
    );

    if (!rows.length) throw new Error("ADDRESS_NOT_FOUND");
    return rows[0];
  },

 // Tạo đơn hàng
  async createOrder(
    conn,
    userId,
    address,
    cartItems,
    note,
    orderCode,
    coupon_code = null,
    discount_amount = 0,
    shipping_fee = 0
  ) {
    const fullAddress = address.full_address; // đã có từ getAddress
    const provinceCode = address.province_code || "UNKNOWN";

    const rawTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalPrice = Math.max(
      rawTotal - (discount_amount || 0) + (shipping_fee || 0),
      0
    );

    const [orderRs] = await conn.query(
      `INSERT INTO orders (
        user_id, address_id, total_price, receiver_name, phone, address, province_code, shipping_fee,
        note, status, created_at, updated_at, order_code,
        coupon_code, discount_amount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW(), ?, ?, ?)`,
      [
        userId,
        address.id,
        totalPrice,
        address.receiver_name,
        address.phone,
        fullAddress,
        provinceCode,
        shipping_fee,
        note,
        orderCode,
        coupon_code,
        discount_amount
      ]
    );

    const orderId = orderRs.insertId;
    return { orderId, totalPrice };
  },



  async createPayment(conn, orderId, method) {
  // Lấy tổng tiền đơn hàng
    const [[order]] = await conn.query(
      "SELECT total_price FROM orders WHERE id = ?",
      [orderId]
    );
    const amount = order ? order.total_price : 0;

    await conn.query(
      `INSERT INTO payments 
      (order_id, payment_method, payment_status, transaction_id, payment_date, amount)
      VALUES (?, ?, 'PENDING', NULL, NOW(), ?)`,
      [orderId, method?.toUpperCase() || 'COD', amount]
    );
  },


  async clearCart(conn, userId) {
    const [[cart]] = await conn.query("SELECT id FROM carts WHERE user_id = ?", [userId]);
    if (cart) {
      await conn.query("DELETE FROM cart_items WHERE cart_id = ?", [cart.id]);
    }
  },

  async getOrdersByUser(userId) {
    const [orders] = await db.query(
      `SELECT id, order_code, total_price, status, created_at
       FROM orders
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    return orders;
  },

  async getOrderDetailById(id, userId) {
    const [[order]] = await db.query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    if (!order) throw new Error("ORDER_NOT_FOUND");

    const [items] = await db.query(
      `SELECT oi.*, p.name AS product_name, p.image_public_id, u.name AS unit_name
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN units u ON p.unit_id = u.id
       WHERE oi.order_id = ?`,
      [id]
    );

    const [[payment]] = await db.query(
      `SELECT * FROM payments WHERE order_id = ?`,
      [id]
    );

    return { order, items, payment };
  },

  async updateOrderStatus(id, status) {
    const [result] = await db.query(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );
    if (result.affectedRows === 0) throw new Error("ORDER_NOT_FOUND");
  },
  
  async getOrderStatus(id) {
  const [[row]] = await db.query(
    `SELECT status FROM orders WHERE id = ?`,
    [id]
  );
  return row ? row.status : null;
}

};

module.exports = Order;
