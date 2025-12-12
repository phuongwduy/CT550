const db = require("../config/db");

const AdminModel = {

  // Lấy toàn bộ người dùng chưa bị xóa
  async getAllUsers() {
    const [rows] = await db.query(
      "SELECT id, name, email, role, phone, address, avatar, auth_provider FROM users WHERE is_deleted = 0"
    );
    return rows;
  },

  // Lấy user theo email (đầy đủ)
  async getUserByEmail(email) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    return rows[0];
  },

  // Lấy user theo ID
  async getUserById(id) {
    const [rows] = await db.query(
      "SELECT * FROM users WHERE id = ? LIMIT 1",
      [id]
    );
    return rows[0];
  },

  // Tạo người dùng mới (hỗ trợ Google + Local)
  async createUser(name, email, hashedPassword, role, avatar, verified = true, provider = "local") {
    const [result] = await db.query(
      `INSERT INTO users 
      (name, email, password, role, avatar, verified, is_deleted, auth_provider)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [name, email, hashedPassword, role, avatar, verified ? 1 : 0, provider]
    );
    return result.insertId;
  },

  // Cập nhật vai trò người dùng
  async updateUserRole(id, role) {
    const [result] = await db.query(
      "UPDATE users SET role = ? WHERE id = ? AND is_deleted = 0",
      [role, id]
    );
    return result.affectedRows > 0;
  },

  // Xóa mềm người dùng
  async deleteUser(id) {
    const [result] = await db.query(
      "UPDATE users SET is_deleted = 1 WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },
  // Khóa tài khoản người dùng
async lockUser(id) {
  const [result] = await db.query(
    "UPDATE users SET is_active = 0 WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
},

// Mở khóa tài khoản người dùng
async unlockUser(id) {
  const [result] = await db.query(
    "UPDATE users SET is_active = 1 WHERE id = ?",
    [id]
  );
  return result.affectedRows > 0;
},

};

module.exports = AdminModel;
