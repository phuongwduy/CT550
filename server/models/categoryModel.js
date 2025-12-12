const db = require('../config/db');

const CategoryModel = {
  // Lấy tất cả danh mục
  async getAll() {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY id ASC');
    return rows;
  },

  // Tạo danh mục mới
  async create(name, description) {
    const [result] = await db.query(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );
    return result.insertId;
  },

  // Cập nhật danh mục
  async update(id, name, description) {
    const [result] = await db.query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );
    return result.affectedRows > 0;
  },

  // Xóa danh mục
  async delete(id) {
    const [result] = await db.query(
      'DELETE FROM categories WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = CategoryModel;
