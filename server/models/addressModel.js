const db = require("../config/db");

const AddressModel = {
  // 📌 Lấy tất cả địa chỉ của user + JOIN tỉnh/xã
  getAllByUser: async (userId) => {
    const [rows] = await db.query(
      `
      SELECT 
        ua.*,
        p.name AS province_name,
        c.name AS commune_name
      FROM user_addresses ua
      LEFT JOIN provinces p ON ua.province_code = p.code
      LEFT JOIN communes c ON ua.commune_code = c.code
      WHERE ua.user_id = ?
      ORDER BY ua.is_default DESC, ua.id DESC
      `,
      [userId]
    );
    return rows;
  },

  // 📌 Lấy chi tiết 1 địa chỉ theo ID
  getById: async (id, userId) => {
    const [rows] = await db.query(
      `
      SELECT 
        ua.*, 
        p.name AS province_name,
        c.name AS commune_name
      FROM user_addresses ua
      LEFT JOIN provinces p ON ua.province_code = p.code
      LEFT JOIN communes c ON ua.commune_code = c.code
      WHERE ua.id = ? AND ua.user_id = ?
      `,
      [id, userId]
    );
    return rows[0];
  },

  // 📌 Tạo địa chỉ mới (không transaction)
  create: async (userId, phone, receiverName, province_code, commune_code, detail, is_default = false) => {
    const [result] = await db.query(
      `
      INSERT INTO user_addresses 
      (user_id, phone, receiver_name, province_code, commune_code, detail, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [userId, phone, receiverName, province_code, commune_code, detail, is_default ? 1 : 0]
    );
    return result.insertId;
  },

  // 📌 Cập nhật địa chỉ (không transaction)
  update: async (id, userId, phone, receiverName, province_code, commune_code, detail, is_default) => {
    const [result] = await db.query(
      `
      UPDATE user_addresses
      SET phone = ?, receiver_name = ?, province_code = ?, commune_code = ?, detail = ?, is_default = ?
      WHERE id = ? AND user_id = ?
      `,
      [phone, receiverName, province_code, commune_code, detail, is_default ? 1 : 0, id, userId]
    );

    return result.affectedRows;
  },

  // 📌 Xoá địa chỉ
  remove: async (id, userId) => {
    const [result] = await db.query(
      "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    return result.affectedRows;
  },

  // 📌 Tạo địa chỉ (dùng transaction)
  createWithConn: async (conn, userId, phone, receiverName, province_code, commune_code, detail, is_default = false) => {
    const [result] = await conn.query(
      `
      INSERT INTO user_addresses 
      (user_id, phone, receiver_name, province_code, commune_code, detail, is_default, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [userId, phone, receiverName, province_code, commune_code, detail, is_default ? 1 : 0]
    );
    return result.insertId;
  },

  // 📌 Cập nhật địa chỉ (dùng transaction)
  updateWithConn: async (conn, id, userId, phone, receiverName, province_code, commune_code, detail, is_default = false) => {
    const [result] = await conn.query(
      `
      UPDATE user_addresses
      SET phone = ?, receiver_name = ?, province_code = ?, commune_code = ?, detail = ?, is_default = ?
      WHERE id = ? AND user_id = ?
      `,
      [phone, receiverName, province_code, commune_code, detail, is_default ? 1 : 0, id, userId]
    );
    return result.affectedRows;
  },
};

module.exports = AddressModel;
