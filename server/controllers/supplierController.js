const db = require("../config/db");

// Lấy danh sách nhà cung cấp
exports.getAllSuppliers = async (req, res) => {
  try {
    const [rows] = await db.query(`
        SELECT * FROM suppliers
        WHERE is_deleted = 0
        ORDER BY created_at DESC
      `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách nhà cung cấp" });
  }
};

// Tạo mới nhà cung cấp
exports.createSupplier = async (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name) return res.status(400).json({ message: "Tên nhà cung cấp là bắt buộc" });

  try {
    const [result] = await db.query(
      "INSERT INTO suppliers (name, email, phone, address) VALUES (?, ?, ?, ?)",
      [name, email, phone, address]
    );
    res.status(201).json({ id: result.insertId, message: "Đã tạo nhà cung cấp" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi tạo nhà cung cấp" });
  }
};

// Cập nhật nhà cung cấp
exports.updateSupplier = async (req, res) => {
  const { name, email, phone, address } = req.body;
  const { id } = req.params;

  try {
    await db.query(
      "UPDATE suppliers SET name = ?, email = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?",
      [name, email, phone, address, id]
    );
    res.json({ message: "Đã cập nhật nhà cung cấp" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi cập nhật nhà cung cấp" });
  }
};

// Xóa nhà cung cấp
exports.deleteSupplier = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE suppliers SET is_deleted = 1 WHERE id = ?", [id]);
    res.json({ message: "Đã ẩn nhà cung cấp (soft-delete) thành công" });
  } catch (err) {
    console.error("Lỗi khi xoá nhà cung cấp:", err);
    res.status(500).json({ message: "Lỗi khi xoá nhà cung cấp" });
  }
};

