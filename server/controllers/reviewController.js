const db = require("../config/db");

// Lấy danh sách đánh giá
exports.getReviews = async (req, res) => {
  const { product_id } = req.query;
  try {
    const sql = product_id
      ? `SELECT r.*, u.name AS user_name, u.avatar AS user_avatar, p.name AS product_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.id
        WHERE r.product_id = ? ORDER BY r.created_at DESC`
      : `SELECT r.*, u.name AS user_name, u.avatar AS user_avatar, p.name AS product_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN products p ON r.product_id = p.id
        ORDER BY r.created_at DESC`;


    const [rows] = await db.execute(sql, product_id ? [product_id] : []);
    res.json(rows);
  } catch (err) {
    console.error("Lỗi getReviews:", err);
    res.status(500).json({ error: "Lỗi khi lấy đánh giá" });
  }
};

// Tạo đánh giá mới
exports.createReview = async (req, res) => {
  const { product_id, rating, comment } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ error: "Bạn chưa đăng nhập." });
  if (!product_id || !rating) {
    return res.status(400).json({ error: "Thiếu thông tin bắt buộc." });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Số sao phải từ 1 đến 5." });
  }

  try {

    // Kiểm tra đã mua hàng chưa
    const checkSql = `
      SELECT od.product_id 
      FROM order_items od
      JOIN orders o ON od.order_id = o.id
      WHERE o.user_id = ?
        AND od.product_id = ?
        AND o.status = 'DELIVERED'
      LIMIT 1
    `;
    const [check] = await db.execute(checkSql, [userId, product_id]);

    if (check.length === 0) {
      return res.status(403).json({ error: "Bạn phải mua sản phẩm này mới được đánh giá." });
    }

    // OK → Cho viết review
    const sql = `INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)`;
    await db.execute(sql, [product_id, userId, rating, comment]);

    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi createReview:", err);
    res.status(500).json({ error: "Lỗi khi gửi đánh giá." });
  }
};



// Xóa đánh giá
exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    // Xóa phản hồi trước
    await db.execute(`DELETE FROM review_replies WHERE review_id = ?`, [id]);

    // Sau đó xóa đánh giá
    await db.execute(`DELETE FROM reviews WHERE id = ?`, [id]);

    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi deleteReview:", err);
    res.status(500).json({ error: "Lỗi khi xóa đánh giá" });
  }
};
exports.deleteReply = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute(`DELETE FROM review_replies WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi deleteReply:", err);
    res.status(500).json({ error: "Lỗi khi xóa phản hồi" });
  }
};


exports.createReply = async (req, res) => {
  const { review_id, reply_text } = req.body;
  const userId = req.user?.id;

  if (!review_id || !reply_text) {
    return res.status(400).json({ error: "Thiếu thông tin phản hồi" });
  }

  try {
    await db.execute(
      "INSERT INTO review_replies (review_id, user_id, reply_text) VALUES (?, ?, ?)",
      [review_id, userId, reply_text]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi createReply:", err);
    res.status(500).json({ error: "Lỗi khi gửi phản hồi" });
  }
};
// Lấy danh sách phản hồi theo sản phẩm
exports.getRepliesByProduct = async (req, res) => {
  const { product_id } = req.query;

  try {
    let rows;

    if (product_id) {
      // trường hợp có product_id: lọc theo sản phẩm
      [rows] = await db.execute(`
        SELECT rr.*, u.name AS user_name, u.avatar AS user_avatar
        FROM review_replies rr
        JOIN reviews r ON rr.review_id = r.id
        JOIN users u ON rr.user_id = u.id
        WHERE r.product_id = ?
        ORDER BY rr.created_at ASC
      `, [product_id]);
    } else {
      // Trường hợp không có product_id: lấy tất cả phản hồi
      [rows] = await db.execute(`
        SELECT rr.*, u.name AS user_name, u.avatar AS user_avatar
        FROM review_replies rr
        JOIN users u ON rr.user_id = u.id
        ORDER BY rr.created_at ASC
      `);
    }

    res.json(rows);
  } catch (err) {
    console.error("Lỗi getRepliesByProduct:", err);
    res.status(500).json({ error: "Lỗi khi lấy phản hồi" });
  }
};


// Cập nhật trạng thái ẩn/hiện
exports.toggleReviewHidden = async (req, res) => {
  const { id } = req.params;
  const { is_hidden } = req.body;

  try {
    await db.execute(`UPDATE reviews SET is_hidden = ? WHERE id = ?`, [is_hidden, id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Lỗi toggleReviewHidden:", err);
    res.status(500).json({ error: "Lỗi khi cập nhật trạng thái đánh giá" });
  }
};
exports.getReviewStats = async (req, res) => {
  const { product_id } = req.query;
  try {
    const [rows] = await db.execute(
      `SELECT COUNT(*) AS total, AVG(rating) AS average FROM reviews WHERE product_id = ? AND is_hidden = FALSE`,
      [product_id]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error("Lỗi getReviewStats:", err);
    res.status(500).json({ error: "Lỗi khi lấy thống kê đánh giá" });
  }
};

// Kiểm tra user có quyền đánh giá
exports.checkCanReview = async (req, res) => {
  const userId = req.user?.id;
  const { product_id } = req.query;

  if (!userId) {
    return res.json({ can_review: false });
  }

  try {
    // Chỉ tính đơn đã giao thành công
    const sql = `
      SELECT od.product_id 
      FROM order_items od
      JOIN orders o ON od.order_id = o.id
      WHERE o.user_id = ? 
        AND od.product_id = ?
        AND o.status = 'DELIVERED'
      LIMIT 1
    `;
    const [rows] = await db.execute(sql, [userId, product_id]);

    if (rows.length > 0) {
      return res.json({ can_review: true });
    }

    res.json({ can_review: false });
  } catch (error) {
    console.error("Lỗi checkCanReview:", error);
    res.status(500).json({ can_review: false });
  }
};
