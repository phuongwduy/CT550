const db = require("../config/db");

const BatchController = {
  // Lấy danh sách lô theo sản phẩm
  async getProductBatches(req, res) {
    try {
      const { product_id } = req.params;

      //  Kiểm tra đầu vào
      if (!product_id || isNaN(product_id)) {
        return res.status(400).json({ message: "Thiếu hoặc sai product_id." });
      }

     const [batches] = await db.query(
          `
          SELECT 
            i.id AS batch_id,
            i.import_price,
            i.quantity,
            i.remaining_quantity,
            t.created_at,
            t.type,
            t.id AS ticket_id,
            t.note,
            s.name AS supplier_name,
            p.id AS product_id,
            p.name AS product_name,
            p.stock AS current_stock,
            EXISTS (
              SELECT 1 FROM inventory_movements m WHERE m.inventory_item_id = i.id
            ) AS has_history
          FROM inventory_items i
          JOIN inventory_tickets t ON i.ticket_id = t.id
          JOIN products p ON i.product_id = p.id
          LEFT JOIN suppliers s ON t.supplier_id = s.id
          WHERE i.product_id = ? AND t.type = 'import'
          ORDER BY i.id ASC
          `,
          [product_id]
        );


      if (batches.length === 0) {
        // Vẫn trả product để frontend hiển thị thông tin cơ bản
        const [[product]] = await db.query(
          `SELECT id, name, stock FROM products WHERE id = ?`,
          [product_id]
        );

        if (!product)
          return res.status(404).json({ message: "Không tìm thấy sản phẩm này." });

        return res.json({
          product,
          batches: [],
          message: "Sản phẩm này chưa có lô hàng nào.",
        });
      }

      const productInfo = {
        id: batches[0].product_id,
        name: batches[0].product_name,
        stock: batches[0].current_stock,
      };

      res.json({ product: productInfo, batches });
    } catch (err) {
      console.error(" getProductBatches error:", err);
      res.status(500).json({ message: "Lỗi lấy danh sách lô hàng." });
    }
  },

  // Lấy tổng hợp kho
  async getInventoryOverview(req, res) {
    try {
      const [products] = await db.query(`
        SELECT 
          p.id,
          p.name,
          COALESCE(p.stock, 0) AS stock,
          u.name AS unit,
          s.name AS supplier
        FROM products p
        LEFT JOIN units u ON p.unit_id = u.id
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        where p.is_active = 1
        ORDER BY p.name ASC
      `);

      res.json(products);
    } catch (err) {
      console.error(" getInventoryOverview error:", err);
      res.status(500).json({ message: "Lỗi lấy thống kê kho." });
    }
  },

  //  Lịch sử di chuyển kho của 1 lô hàng
  async getBatchMovements(req, res) {
    try {
      const { batch_id } = req.params;

      if (!batch_id || isNaN(batch_id)) {
        return res.status(400).json({ message: "Thiếu hoặc sai batch_id." });
      }

      const [movements] = await db.query(
          `
          SELECT 
            m.id,
            m.type,
            m.quantity,
            m.note,
            m.created_at,
            m.order_id,
            o.order_code
          FROM inventory_movements m
          LEFT JOIN orders o ON m.order_id = o.id
          WHERE m.inventory_item_id = ?
          ORDER BY m.created_at DESC
          `,
          [batch_id]
        );


      if (movements.length === 0)
        return res.json({
          message: "Không có lịch sử xuất/nhập nào cho lô hàng này.",
          movements: [],
        });

      res.json({ movements });
    } catch (err) {
      console.error("getBatchMovements error:", err);
      res.status(500).json({ message: "Lỗi khi lấy lịch sử di chuyển lô hàng." });
    }
  },

};

module.exports = BatchController;
