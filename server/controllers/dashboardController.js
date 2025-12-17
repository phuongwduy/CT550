const db = require("../config/db");

const DashboardController = {
  async getStats(req, res) {
    try {
      const { from, to } = req.query;
      const group = req.query.group || "month"; 

      if (!from || !to) {
        return res.status(400).json({ message: "Thiếu tham số from/to (YYYY-MM-DD)." });
      }
      if (from > to) {
        return res.status(400).json({ message: "Khoảng thời gian không hợp lệ (from > to)." });
      }

      // Group theo ngày/tháng/năm
      let periodExpr; 
      let groupExpr;  
      if (group === "day") {
        periodExpr = "DATE(o.created_at)";
        groupExpr = "DATE(o.created_at)";
      } else if (group === "year") {
        periodExpr = "YEAR(o.created_at)";
        groupExpr = "YEAR(o.created_at)";
      } else {
        periodExpr = "DATE_FORMAT(o.created_at, '%Y-%m')";
        groupExpr = "DATE_FORMAT(o.created_at, '%Y-%m')";
      }

      
      // Doanh thu
      const [[revenue]] = await db.query(
        `
        SELECT COALESCE(SUM(o.total_price), 0) AS total_revenue
        FROM orders o
        WHERE o.status IN ('completed', 'delivered')
          AND DATE(o.created_at) BETWEEN ? AND ?
        `,
        [from, to]
      );

      // Lợi nhuận
      const [[profit]] = await db.query(
        `
        SELECT COALESCE(SUM(order_profit), 0) AS total_profit
        FROM (
          SELECT 
            o.id,
            (SUM((oi.price - oi.cost_price) * oi.quantity) - COALESCE(o.discount_amount, 0)) AS order_profit
          FROM orders o
          JOIN order_items oi ON oi.order_id = o.id
          WHERE o.status IN ('completed', 'delivered')
            AND DATE(o.created_at) BETWEEN ? AND ?
          GROUP BY o.id
        ) t
        `,
        [from, to]
      );

      // Tổng đơn hàng
      const [[orders]] = await db.query(
        `
        SELECT COUNT(*) AS total_orders
        FROM orders o
        WHERE o.status IN ('completed', 'delivered')
          AND DATE(o.created_at) BETWEEN ? AND ?
        `,
        [from, to]
      );

      // Người dùng & sản phẩm
      const [[users]] = await db.query(`SELECT COUNT(*) AS total_users FROM users WHERE is_deleted = 0`);
      const [[products]] = await db.query(
        `SELECT COUNT(*) AS total_products FROM products WHERE is_active = 1`
      );

      // Revenue chart
      const [revenueChart] = await db.query(
        `
        SELECT 
          period,
          SUM(order_total) AS total_revenue,
          SUM(order_profit) AS total_profit
        FROM (
          SELECT
            o.id,
            ${periodExpr} AS period,
            o.total_price AS order_total,
            (SUM((oi.price - oi.cost_price) * oi.quantity) - COALESCE(o.discount_amount, 0)) AS order_profit
          FROM orders o
          JOIN order_items oi ON oi.order_id = o.id
          WHERE o.status IN ('completed', 'delivered')
            AND DATE(o.created_at) BETWEEN ? AND ?
          GROUP BY o.id, ${groupExpr}
        ) t
        GROUP BY period
        ORDER BY period
        `,
        [from, to]
      );

      // Recent orders
      const [recentOrders] = await db.query(
        `
        SELECT o.id, o.order_code, o.total_price, o.status, o.created_at, u.name AS user_name
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE DATE(o.created_at) BETWEEN ? AND ?
        ORDER BY o.created_at DESC
        LIMIT 5
        `,
        [from, to]
      );

      // Top products
      const [topProducts] = await db.query(
        `
        SELECT 
          p.id, p.name,
          SUM(oi.quantity) AS total_sold,
          SUM(oi.quantity * oi.price) AS total_revenue
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status IN ('completed', 'delivered')
          AND DATE(o.created_at) BETWEEN ? AND ?
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 5
        `,
        [from, to]
      );

      return res.json({
        summary: {
          total_revenue: Number(revenue.total_revenue) || 0,
          total_profit: Number(profit.total_profit) || 0,
          total_orders: Number(orders.total_orders) || 0,
          total_users: Number(users.total_users) || 0,
          total_products: Number(products.total_products) || 0,
        },
        revenue_chart: revenueChart.map((r) => ({
          period: r.period,
          revenue: Number(r.total_revenue) || 0,
          profit: Number(r.total_profit) || 0,
        })),
        recent_orders: recentOrders,
        top_products: topProducts,
      });
    } catch (err) {
      console.error("DashboardController.getStats error:", err);
      return res.status(500).json({ message: "Lỗi máy chủ khi lấy dữ liệu dashboard." });
    }
  },
};

module.exports = DashboardController;
