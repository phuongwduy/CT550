const db = require("../config/db");

const DashboardController = {
  async getStats(req, res) {
    try {
      const range = req.query.range || "7d"; // mặc định 7 ngày

      // Xác định mốc thời gian lọc theo range
      let dateFilter = "";
      if (range === "7d") dateFilter = "DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
      else if (range === "30d") dateFilter = "DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
      else if (range === "year") dateFilter = "DATE_SUB(CURDATE(), INTERVAL 365 DAY)";

      // Tổng doanh thu
      const [[revenue]] = await db.query(`
        SELECT COALESCE(SUM(total_price), 0) AS total_revenue
        FROM orders
        WHERE status IN ('completed', 'delivered')
      `);

      // Tổng lợi nhuận khi chưa trừ giảm giá
      const [[profit]] = await db.query(`
        SELECT COALESCE(SUM(order_profit), 0) AS total_profit
        FROM (
          SELECT 
            SUM((oi.price - oi.cost_price) * oi.quantity) - o.discount_amount AS order_profit
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          WHERE o.status IN ('completed', 'delivered')
          GROUP BY o.id
        ) AS sub;
      `);

       
      
      // Số đơn hàng, người dùng, sản phẩm
      const [[orders]] = await db.query(`SELECT COUNT(*) AS total_orders FROM orders`);
      const [[users]] = await db.query(`SELECT COUNT(*) AS total_users FROM users where is_deleted = 0`);
      const [[products]] = await db.query(`SELECT COUNT(*) AS total_products FROM products`);

      //  Doanh thu theo ngày (lọc theo range)
      const [revenuesByDay] = await db.query(`
        SELECT 
          DATE(o.created_at) AS date,
          COALESCE(SUM(o.total_price), 0) AS total_revenue,
          COALESCE(SUM((oi.price - oi.cost_price) * oi.quantity), 0) AS total_profit
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE o.status IN ('completed', 'delivered')
          AND o.created_at >= ${dateFilter}
        GROUP BY DATE(o.created_at)
        ORDER BY DATE(o.created_at)
      `);

      //  Đơn hàng gần nhất
      const [recentOrders] = await db.query(`
        SELECT o.id, o.order_code, o.total_price, o.status, o.created_at, u.name AS user_name
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 5
      `);

      // Sản phẩm bán chạy
      const [topProducts] = await db.query(`
        SELECT 
          p.id, p.name,
          SUM(oi.quantity) AS total_sold,
          SUM(oi.quantity * oi.price) AS total_revenue
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status IN ('completed', 'delivered')
          AND o.created_at >= ${dateFilter}
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 5
      `);

      res.json({
        summary: {
          total_revenue: Number(revenue.total_revenue) || 0,
          total_profit: Number(profit.total_profit) || 0,
          total_orders: Number(orders.total_orders) || 0,
          total_users: Number(users.total_users) || 0,
          total_products: Number(products.total_products) || 0,
        },
        revenue_chart: revenuesByDay.map(r => ({
          date: r.date,
          revenue: Number(r.total_revenue),
          profit: Number(r.total_profit)
        })),
        recent_orders: recentOrders,
        top_products: topProducts,
      });
    } catch (err) {
      console.error(" DashboardController.getStats error:", err);
      res.status(500).json({ message: "Lỗi máy chủ khi lấy dữ liệu dashboard." });
    }
  },
};

module.exports = DashboardController;
