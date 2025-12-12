const db = require('../config/db');

const UserModel = {
  // 🔍 Lấy thông tin người dùng theo email
  async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  // ➕ Thêm người dùng mới
  async createUser(name, email, hashedPassword) {
    const sql =
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [
      name,
      email,
      hashedPassword,
      'user',
    ]);
    return result.insertId;
  },

  // 🔍 Lấy người dùng theo ID
  async findById(id) {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // ✏️ Cập nhật thông tin người dùng
  async updateUser(id, name, phone, address) {
    const sql =
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?';
    const [result] = await db.query(sql, [name, phone, address, id]);
    return result.affectedRows > 0;
  },
};

module.exports = UserModel;
