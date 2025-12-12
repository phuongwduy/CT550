const db = require("../config/db");
const Order = require("../models/orderModel");
const Inventory = require("../models/inventoryModel");

const OrderController = {
  checkout: async (req, res) => {
    const userId = req.user?.id;
    const {
      cartItems,
      address_id,
      shipping_fee = 0,
      note = "",
      payment_method = "COD",
      coupon_code = null,
      discount_amount = 0
    } = req.body;

    if (!userId) return res.status(401).json({ message: "UNAUTHORIZED" });
    if (!Array.isArray(cartItems) || cartItems.length === 0)
      return res.status(400).json({ message: "Giỏ hàng trống." });
    if (!address_id)
      return res.status(400).json({ message: "Thiếu địa chỉ giao hàng." });

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      //  Kiểm tra tồn kho
      await Order.checkStock(conn, cartItems);

      // Lấy địa chỉ giao hàng
      const addr = await Order.getAddress(conn, address_id, userId);
      const orderCode = `ORD-${Date.now()}-${userId}`;

      // Tạo đơn hàng chính
      const { orderId, totalPrice } = await Order.createOrder(
        conn,
        userId,
        addr,
        cartItems,
        note,
        orderCode,
        coupon_code,
        discount_amount,
        shipping_fee
      );

     
      const mergedItems = [];
      for (const item of cartItems) {
        const existing = mergedItems.find(i => i.product_id === item.product_id);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          mergedItems.push({ ...item });
        }
      }

      // Ghi từng sản phẩm sau khi gộp
      for (const item of mergedItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, cost_price)
        VALUES (?, ?, ?, ?, NULL)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }



      // Ghi thông tin thanh toán
      await Order.createPayment(conn, orderId, payment_method);

      // Xóa giỏ hàng
      if (payment_method.toUpperCase() === "COD") {
        await Order.clearCart(conn, userId);
      }

      await conn.commit();

      // Nếu là thanh toán online thì trả redirect link
      if (["BANK", "VNPAY", "PAYPAL"].includes(payment_method.toUpperCase())) {
        return res.status(200).json({
          message: "Đơn hàng đã được tạo. Chuyển đến cổng thanh toán...",
          orderId,
          payment_method,
          redirect_url: `/payment/${payment_method.toLowerCase()}?order_id=${orderId}`
        });
      }

      // Thanh toán COD
      res.status(201).json({
        message: "Đặt hàng thành công",
        orderId,
        total_price: totalPrice,
        payment_method,
        order_code: orderCode
      });
    } catch (err) {
      await conn.rollback();
      console.error("checkout error:", err);

      if (err.message.startsWith("OUT_OF_STOCK")) {
        const pid = err.message.split(":")[1];
        return res
          .status(400)
          .json({ message: `Sản phẩm  không đủ quá tồn kho.` });
      }

      if (err.message === "ADDRESS_NOT_FOUND") {
        return res.status(404).json({ message: "Địa chỉ không tồn tại." });
      }

      if (err.message.includes("Không đủ tồn kho")) {
        return res.status(400).json({ message: err.message });
      }

      res.status(500).json({ message: "Lỗi khi xử lý đơn hàng." });
    } finally {
      conn.release();
    }
  },

  // Danh sách đơn hàng của khách hàng
  getMyOrders: async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "UNAUTHORIZED" });

    try {
      const orders = await Order.getOrdersByUser(userId);
      res.json(orders);
    } catch (err) {
      console.error("getMyOrders error:", err);
      res.status(500).json({ message: "SERVER_ERROR" });
    }
  },

  // Chi tiết đơn hàng
  getOrderDetail: async (req, res) => {
    const userId = req.user?.id;
    const { id } = req.params;

    try {
      const data = await Order.getOrderDetailById(id, userId);
      res.json(data);
    } catch (err) {
      console.error("getOrderDetail error:", err);
      if (err.message === "ORDER_NOT_FOUND") {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
      }
      res.status(500).json({ message: "SERVER_ERROR" });
    }
  },


};

module.exports = OrderController;
