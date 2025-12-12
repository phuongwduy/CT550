const db = require("../config/db");
const { sendCouponEmail } = require("../utils/mailCoupon");
// Lấy danh sách mã giảm giá
exports.getCoupons = async (req, res) => {
  try {
    const [coupons] = await db.execute("SELECT * FROM coupons ORDER BY created_at DESC");
    res.json(coupons);
  } catch (err) {
    console.error("Lỗi lấy danh sách mã giảm giá:", err);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy danh sách mã giảm giá" });
  }
};

// Lấy chi tiết mã theo ID
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM coupons WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy mã giảm giá" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Lỗi lấy mã giảm giá:", err);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy mã giảm giá" });
  }
};

// Tạo mã giảm giá mới
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      discount_type,
      discount_value,
      min_order,
      max_discount,
      expires_at,
      is_active
    } = req.body;

    console.log("Dữ liệu tạo mã:", req.body);

    if (!code || !discount_type || !discount_value) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    const [existing] = await db.execute("SELECT id FROM coupons WHERE code = ?", [code]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Mã giảm giá đã tồn tại" });
    }
    const [duplicate] = await db.execute(
      "SELECT id FROM coupons WHERE code = ? AND id <> ?",
      [code, id]
    );
    if (duplicate.length > 0) {
      return res.status(400).json({ error: "Mã giảm giá đã tồn tại" });
    }
    await db.execute(
      `INSERT INTO coupons (code, discount_type, discount_value, min_order, max_discount, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code, discount_type, discount_value, min_order || null, max_discount || null, expires_at || null, is_active ?? 1]
    );

    res.status(201).json({ message: "Tạo mã giảm giá thành công" });
  } catch (err) {
    console.error("Lỗi tạo mã giảm giá:", err);
    res.status(500).json({ error: "Lỗi hệ thống khi tạo mã giảm giá" });
  }
};

// Cập nhật mã giảm giá
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      discount_type,
      discount_value,
      min_order,
      max_discount,
      expires_at,
      is_active
    } = req.body;

    console.log("Dữ liệu cập nhật mã:", req.body);

    const [existing] = await db.execute("SELECT id FROM coupons WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy mã giảm giá" });
    }
    const [duplicate] = await db.execute(
      "SELECT id FROM coupons WHERE code = ? AND id <> ?",
      [code, id]
    );
    if (duplicate.length > 0) {
      return res.status(400).json({ error: "Mã giảm giá đã tồn tại" });
    }
    await db.execute(
      `UPDATE coupons SET code = ?, discount_type = ?, discount_value = ?, min_order = ?, max_discount = ?, expires_at = ?, is_active = ?
       WHERE id = ?`,
      [code, discount_type, discount_value, min_order || null, max_discount || null, expires_at || null, is_active ?? 1, id]
    );

    res.json({ message: "Cập nhật mã giảm giá thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật mã giảm giá:", err);
    res.status(500).json({ error: "Lỗi hệ thống khi cập nhật mã giảm giá" });
  }
};

// Xóa mã giảm giá
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.execute("SELECT id FROM coupons WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy mã giảm giá" });
    }

    await db.execute("DELETE FROM coupons WHERE id = ?", [id]);

    res.json({ message: "Xóa mã giảm giá thành công" });
  } catch (err) {
    console.error("Lỗi xóa mã giảm giá:", err);
    res.status(500).json({ error: "Lỗi hệ thống khi xóa mã giảm giá" });
  }
};

// Áp dụng mã giảm giá cho đơn hàng
exports.applyCoupon = async (req, res) => {
  try {
    const { code, total_price } = req.body;

    if (!code || !total_price) {
      return res.status(400).json({ error: "Thiếu mã giảm giá hoặc tổng tiền đơn hàng" });
    }

    const [rows] = await db.execute(
      `SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Mã giảm giá không hợp lệ hoặc đã hết hạn" });
    }

    const coupon = rows[0];

    if (coupon.min_order && total_price < coupon.min_order) {
      return res.status(400).json({ error: `Đơn hàng phải từ ${Number(coupon.min_order).toLocaleString()}₫ để dùng mã này` });
    }

    let discount = 0;

    if (coupon.discount_type === "percent") {
      discount = (total_price * coupon.discount_value) / 100;
      if (coupon.max_discount && discount > coupon.max_discount) {
        discount = coupon.max_discount;
      }
    } else if (coupon.discount_type === "fixed") {
      discount = coupon.discount_value;
    }

    const final_price = Math.max(total_price - discount, 0);

    res.json({
      coupon_id: coupon.id,
      discount_amount: discount,
      final_price
    });
  } catch (err) {
    console.error("Lỗi áp dụng mã giảm giá:", err);
    res.status(500).json({ error: "Lỗi hệ thống khi áp dụng mã giảm giá" });
  }
};

exports.sendCouponToCustomer = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Thiếu email" });
    }

    // Lấy mã giảm giá mới nhất, còn hiệu lực
    const [rows] = await db.execute(`
      SELECT * FROM coupons 
      WHERE is_active = 1 AND (expires_at IS NULL OR expires_at > NOW()) 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Không có mã giảm giá nào đang hoạt động" });
    }

    const coupon = rows[0];

    await sendCouponEmail(email, coupon);
    res.json({ success: true, message: "Đã gửi mã giảm giá" });
  } catch (err) {
    console.error("Lỗi gửi mã giảm giá:", err);
    res.status(500).json({ error: "Lỗi hệ thống khi gửi mã giảm giá" });
  }
};