const db = require("../../config/db");
const Order = require("../../models/orderModel");
const Inventory = require("../../models/inventoryModel");
const AdminOrderController = {
  getAllOrders: async (req, res) => {
    try {
      const [orders] = await db.query(`
        SELECT o.id, o.order_code, o.total_price, o.status, o.created_at, u.name AS user_name
        FROM orders o
        JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
      `);
      res.json(orders);
    } catch (err) {
      console.error("getAllOrders error:", err);
      res.status(500).json({ message: "SERVER_ERROR" });
    }
  },

  getOrderById: async (req, res) => {
  const { id } = req.params;
    try {
      const [[order]] = await db.query(`
        SELECT o.*, 
              p.payment_method, 
              p.payment_status, 
              p.transaction_id, 
              p.amount, 
              p.payment_date
        FROM orders o
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.id = ?
      `, [id]);

      if (!order) return res.status(404).json({ message: "ORDER_NOT_FOUND" });

      // Lấy danh sách sản phẩm trong đơn
      const [items] = await db.query(`
        SELECT oi.quantity, oi.price, pr.name, pr.image
        FROM order_items oi
        JOIN products pr ON pr.id = oi.product_id
        WHERE oi.order_id = ?
      `, [id]);

      res.json({ ...order, items });
    } catch (err) {
      console.error("getOrderById error:", err);
      res.status(500).json({ message: "SERVER_ERROR" });
    }
  },


 updateOrderStatus: async (req, res) => {
  const { id } = req.params; // order_id
  const { status} = req.body;


  const allowed = [
    "pending", "confirmed", "packing", "shipping",
    "delivered", "cancelled"
  ];

  if (!allowed.includes(status))
    return res.status(400).json({ message: "Trạng thái không hợp lệ." });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Lấy trạng thái hiện tại
    const currentStatus = await Order.getOrderStatus(id);
    if (!currentStatus)
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    
    //Lấy trạng thái thanh toán
    const [[payment]] = await conn.query(
        `SELECT payment_method, payment_status 
        FROM payments 
        WHERE order_id = ?`,
        [id]
      );
    //  HUỶ ĐƠN HÀNG
    if (status === "cancelled") {
      if (!["pending", "confirmed", "packing"].includes(currentStatus)) {
        await conn.rollback();
        return res.status(400).json({
          message: `Đơn hàng ở trạng thái "${currentStatus}" không thể hủy.`,
        });
      }
      
      // Nếu đã xác nhận → hoàn kho đúng FIFO (dùng log inventory_movements)
      if (currentStatus === "confirmed") {
        await Inventory.restoreStockFIFO(id);
        await conn.query(
          `UPDATE inventory_tickets 
          SET status='voided' 
          WHERE order_id=? AND type='export' AND status='active'`,
          [id]
      );
      // Giảm số lượng đã bán của sản phẩm
        const [items] = await conn.query(
          `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
          [id]
        );

        for (const item of items) {
          await conn.query(
            `UPDATE products 
            SET sold_count = GREATEST(sold_count - ?, 0)
            WHERE id = ?`,
            [item.quantity, item.product_id]
          );
        }
      }

      await Order.updateOrderStatus(id, "cancelled");
      await conn.commit();
      return res.json({ message: "Đơn hàng đã được hủy và hoàn kho thành công." });
    }

    // XÁC NHẬN ĐƠN HÀNG
    if (status === "confirmed" && currentStatus === "pending") {
      const [items] = await conn.query(
        `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
        [id]
      );
      // if (payment.payment_method === "BANK" && payment.payment_status !== "COMPLETED") {
      //   await conn.rollback();
      //   return res.status(400).json({
      //     message: "Đơn hàng BANK chưa thanh toán thành công, không thể xác nhận.",
      //   });
      // }
      for (const item of items) {
        const available = await Inventory.checkAvailableStock(item.product_id);
        if (available < item.quantity) {
          await conn.rollback();
          return res.status(400).json({
            message: `Không đủ tồn kho cho sản phẩm. Hiện còn ${available}, yêu cầu ${item.quantity}`
          });
        }
      }
      const [[order]] = await conn.query(
        `SELECT order_code FROM orders WHERE id=?`,
        [id]
      );
      const ticketId = await Inventory.createTicket({
        type: "export",
        supplier_id: null,
        user_id: req.user.id,
        note: `Xuất kho theo đơn hàng #${order.order_code}`,
        order_id: id
      }, conn);

      await Inventory.addItems(
        items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          import_price: null
        })),
        ticketId,
        conn
      );
      for (const item of items) {
        const { totalCost, unitCost } = await Inventory.deductStockFIFO(
          item.product_id,
          item.quantity,
          id,
          `Xuất kho theo đơn hàng #${order.order_code}`,
        );

        // Ghi giá vốn cho từng sản phẩm trong đơn
        await conn.query(
          `UPDATE order_items
           SET cost_price = ?
           WHERE order_id = ? AND product_id = ?`,
          [unitCost, id, item.product_id]
        );
        // Tăng số lượng đã bán
            await conn.query(
              `UPDATE products 
              SET sold_count = sold_count + ?
              WHERE id = ?`,
              [item.quantity, item.product_id]
            );
      }

      await Order.updateOrderStatus(id, "confirmed");
      await conn.query(
        `UPDATE orders 
        SET ticket_id=?, status='confirmed', updated_at=NOW() 
        WHERE id=?`,
        [ticketId, id]
      );
      await conn.commit();
      return res.json({ message: "Đơn hàng đã được xác nhận và trừ kho theo FIFO." });
    }

    // Các trạng thái khác (packing, shipping, delivered)
    const transitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["packing", "cancelled"],
      packing: ["shipping", "cancelled"],
      shipping: ["delivered"],
      delivered: [],
      cancelled: []
    };

    const nextAllowed = transitions[currentStatus] || [];
    if (!nextAllowed.includes(status)) {
      await conn.rollback();
      return res.status(400).json({
        message: `Không thể chuyển từ trạng thái "${currentStatus}" sang "${status}".`,
      });
    }

    await Order.updateOrderStatus(id, status);
    await conn.commit();
    res.json({ message: `Đơn hàng đã được cập nhật trạng thái: ${status}` });
  } catch (err) {
    await conn.rollback();
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ message: "SERVER_ERROR" });
  } finally {
    conn.release();
  }
}


};

module.exports = AdminOrderController;
